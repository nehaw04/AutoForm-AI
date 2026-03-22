from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer, util
from PIL import Image
import io
import cv2
import numpy as np
import re
import pytesseract
import torch
import json # 🔴 NEW
import os   # 🔴 NEW

APP_NAME = "AutoForm-AI (Commercial Vector Brain)"
print(f"\n🚀 STARTING {APP_NAME}...")
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 🧠 1. THE AI MEMORY SYSTEM ---
print("⏳ Loading Semantic Models...")
embedder = SentenceTransformer('all-MiniLM-L6-v2')

VAULT_KEYS = ["Name", "Email", "Phone", "Registration Number", "ID", "Gender", "Date of Birth", "Blood Group"]
vault_embeddings = embedder.encode(VAULT_KEYS, convert_to_tensor=True)

# Load the "Ban List" from local storage
MEMORY_FILE = "banned_memory.json"
if os.path.exists(MEMORY_FILE):
    with open(MEMORY_FILE, "r") as f:
        banned_texts = json.load(f)
else:
    # Default noise the system should always ignore
    banned_texts = ["SIGNATURE", "AUTHORITY", "WEBSITE", "VALID UPTO", "OFFICE ADDRESS"]

# Convert banned words into math vectors
def get_banned_embeddings():
    return embedder.encode(banned_texts, convert_to_tensor=True)

banned_embeddings = get_banned_embeddings()

class LabelRequest(BaseModel):
    labels: list[str]
    
class LearnRequest(BaseModel):
    text: str
# ----------------------------------

def split_image_into_lines(pil_image):
    img_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (50, 5))
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=lambda ctr: cv2.boundingRect(ctr)[1])
    line_crops = []
    for ctr in contours:
        x, y, w, h = cv2.boundingRect(ctr)
        if h > 15 and w > 20: 
            crop = pil_image.crop((x, y, x + w, y + h))
            line_crops.append(crop)
    return line_crops


@app.post("/extract")
async def extract_text(file: UploadFile = File(...), language: str = Form("english")):
    image_bytes = await file.read()
    original_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    if original_image.height > 1500:
        scale_factor = 1500 / original_image.height
        new_width = int(original_image.width * scale_factor)
        original_image = original_image.resize((new_width, 1500), Image.Resampling.LANCZOS)

    extracted_data = []
    crops = split_image_into_lines(original_image)
    if not crops: crops = [original_image]
    
    extracted_data = []
    crops = split_image_into_lines(original_image)
    if not crops: crops = [original_image]
    
    # --- SMART CONTEXT VARIABLES ---
    address_buffer = [] # Memory to hold multi-line addresses
    capturing_address = False
    
    for crop in crops:
        text = pytesseract.image_to_string(crop, config='--psm 7').strip()
        text = re.sub(r'[^a-zA-Z0-9\s\@\.\+\-\:]', '', text).strip()
        
        # 1. TRASH FILTER: Ignore tiny words and known garbage
        if len(text) < 3 or text.upper() in ["GOVT OF INDIA", "FATHER", "MOTHER", "SIGNATURE", "DOB", "NAME"]: 
            continue

        # 2. THE AI VECTOR FILTER (Keep this intact)
        text_embedding = embedder.encode(text, convert_to_tensor=True)
        cos_scores = util.cos_sim(text_embedding, banned_embeddings)[0]
        if torch.max(cos_scores).item() > 0.80:
            print(f"🛑 AI Auto-Filtered Concept: '{text}'")
            continue 

        text_upper = text.upper()
        clean_text_no_spaces = text.replace(" ", "") 
        tag = None 
        
        # --- 3. BULLETPROOF PHONE EXTRACTOR ---
        # Strip everything except digits. If it leaves 10 digits, it's a phone.
        digits_only = re.sub(r'\D', '', text)
        if len(digits_only) >= 10 and len(digits_only) <= 12:
            tag = "Phone"
            text = digits_only[-10:] # Grab just the last 10 digits
            capturing_address = False

        # --- 4. ADDRESS MERGER ---
        elif "ADDRESS" in text_upper or "ADD:" in text_upper:
            capturing_address = True
            text = text_upper.replace("ADDRESS", "").replace("ADD:", "").replace(":", "").strip()
            if text: address_buffer.append(text)
            continue
            
        elif capturing_address:
            address_buffer.append(text)
            # If we hit a 6-digit Indian PIN code, the address is finished!
            if re.search(r'\b\d{6}\b', text):
                extracted_data.append({"text": ", ".join(address_buffer), "tag": "Address"})
                capturing_address = False
                address_buffer = []
            continue

        # --- 5. STRICTER REGULAR FIELDS ---
        elif "BLOOD GROUP" in text_upper: 
            tag = "Blood Group"
            text = text_upper.replace("BLOOD GROUP", "").replace(":", "").strip() 
        elif "@" in text and "." in text: 
            tag = "Email"
        elif re.search(r'\b\d{2}[A-Z]{3}\d{5}\b', clean_text_no_spaces): 
            tag = "Registration Number"
            
        # --- 6. STRICT NAME VALIDATION ---
        # Must be letters only, 2-3 words, and cannot be all uppercase (which usually means an address line)
        elif re.match(r'^[A-Za-z\s\.]+$', text) and 1 < len(text.split()) <= 3 and not text.isupper():
            tag = "Name"
            
        # Only add to UI if we actually identified it
        if tag:
            extracted_data.append({"text": text, "tag": tag})

    # Catch any leftover address lines if the PIN code was missing
    if len(address_buffer) > 0:
         extracted_data.append({"text": ", ".join(address_buffer), "tag": "Address"})

    print("✅ Scan Complete!")
    return {"status": "success", "results": extracted_data}


# --- 🧠 3. THE REINFORCEMENT LEARNING ENDPOINT ---
@app.post("/learn")
async def learn_bad_text(req: LearnRequest):
    bad_text = req.text.strip()
    if bad_text and bad_text not in banned_texts:
        banned_texts.append(bad_text)
        
        # Save to local file
        with open(MEMORY_FILE, "w") as f:
            json.dump(banned_texts, f)
            
        # Update the live mathematical vectors
        global banned_embeddings
        banned_embeddings = get_banned_embeddings()
        
        print(f"🧠 Human Feedback Received! Learned to ignore: '{bad_text}'")
        
    return {"status": "success"}


@app.post("/match-labels")
async def match_labels(req: LabelRequest):
    if not req.labels: return {"matches": {}}
    label_embeddings = embedder.encode(req.labels, convert_to_tensor=True)
    cosine_scores = util.cos_sim(label_embeddings, vault_embeddings)

    matches = {}
    for i, website_label in enumerate(req.labels):
        best_idx = torch.argmax(cosine_scores[i]).item()
        best_score = cosine_scores[i][best_idx].item()
        if best_score > 0.60:  
            matches[website_label] = VAULT_KEYS[best_idx]

    return {"matches": matches}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)