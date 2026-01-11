from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from pydantic import BaseModel
from PIL import Image
from thefuzz import fuzz
import io
import re
import cv2
import numpy as np
import uvicorn
import spacy
import easyocr

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- STARTUP LOGS (KEEP THESE) ---
print("\n" + "="*40)
print("🚀 MOSIP FORM FALCON - BACKEND STARTING")
print("="*40)

print("1. Loading TrOCR Base (Handwriting)...")
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten")

print("2. Loading EasyOCR (Multilingual)...")
reader = easyocr.Reader(['en', 'hi'], gpu=False)

print("3. Loading Spacy (Context Brain)...")
try:
    nlp = spacy.load("en_core_web_sm")
except:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

print("="*40)
print("✅ SYSTEM READY - WAITING FOR EXTENSION")
print("="*40 + "\n")

class VerificationPayload(BaseModel):
    ocr_data: dict
    form_data: dict

def split_image_into_lines(pil_image):
    img_cv = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
    gray = cv2.cvtColor(img_cv, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY_INV)
    kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 3))
    dilated = cv2.dilate(thresh, kernel, iterations=1)
    contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    contours = sorted(contours, key=lambda ctr: cv2.boundingRect(ctr)[1])
    line_crops = []
    for ctr in contours:
        x, y, w, h = cv2.boundingRect(ctr)
        if h > 20 and w > 20: 
            crop = pil_image.crop((x, y, x + w, y + h))
            line_crops.append(crop)
    return line_crops

@app.post("/extract")
async def extract_text(
    file: UploadFile = File(...),
    language: str = Form("english")
):
    # REMOVED: print(f"Processing: {file.filename}...") 
    
    image_bytes = await file.read()
    original_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    candidates = []

    if language == "english":
        crops = split_image_into_lines(original_image)
        if not crops: crops = [original_image]
        
        for crop in crops:
            if crop.height < 32: crop = crop.resize((crop.width * 2, crop.height * 2))
            pixel_values = processor(images=crop, return_tensors="pt").pixel_values
            generated_ids = model.generate(pixel_values)
            text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            text = text.strip()

            if ":" in text:
                parts = text.split(":", 1)
                if len(parts[0]) < 15: text = parts[1].strip()

            if len(text) < 2: continue
            
            tag = "Unknown"
            text_lower = text.lower()
            
            if re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text): tag = "Email"
            elif re.search(r'\b[a-z0-9._%+-]+\s[a-z0-9.-]+\.(com|net|org)\b', text_lower): tag = "Email (Check format)"
            elif re.search(r'\d{3}[-.\s]?\d{4}', text) or re.search(r'\+?\d{10}', text): tag = "Phone"
            elif re.match(r'^\d{5,6}$', text): tag = "Pin Code"
            elif text_lower in ["male", "female", "m", "f", "other"]: tag = "Gender"
            elif any(x in text_lower for x in ["road", "street", "st", "rd", "ave", "lane", "layout", "apt", "unit", "block"]): tag = "Address"
            elif any(x in text_lower for x in ["bangalore", "karnataka", "usa", "india", "ny", "ca", "uk", "delhi"]): tag = "City/State"
            elif re.search(r'\d{1,2}[/-]\d{1,2}[/-]\d{2,4}', text): tag = "DOB"
            elif text.isdigit() and int(text) < 120: tag = "Age"
            elif re.match(r'^[A-Za-z\s\.]+$', text):
                doc = nlp(text)
                if doc.ents and doc.ents[0].label_ == "PERSON": tag = "Name"
                elif len(text.split()) > 1 and len(text.split()) < 4: tag = "Name"

            candidates.append({"text": text, "tag": tag})

    else:
        img_np = np.array(original_image)
        results = reader.readtext(img_np)
        for (bbox, text, prob) in results:
            if prob < 0.3: continue
            tag = "Text"
            if re.search(r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}', text): tag = "Email"
            elif re.search(r'\d', text) and len(text) > 4: tag = "ID/Number"
            elif "male" in text.lower() or "female" in text.lower(): tag = "Gender"
            candidates.append({"text": text, "tag": tag})

    return {"status": "success", "candidates": candidates}

@app.post("/verify")
async def verify_data(payload: VerificationPayload):
    ocr = payload.ocr_data
    form = payload.form_data
    results = {}
    total_score = 0
    count = 0
    
    for key in form:
        if key in ocr and form[key]:
            score = fuzz.token_sort_ratio(str(ocr[key]).lower(), str(form[key]).lower())
            results[key] = {"score": score, "status": "Match" if score > 80 else "Mismatch"}
            total_score += score
            count += 1
            
    avg = total_score / count if count > 0 else 0
    return {"status": "success", "overall_score": int(avg), "verdict": "Verified" if avg > 80 else "Check Data", "details": results}

if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)