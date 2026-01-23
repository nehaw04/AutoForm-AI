from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import easyocr
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
from PIL import Image
import io
import torch
import cv2
import numpy as np
import re
import spacy

APP_NAME = "AutoForm-AI"
print(f"\n🚀 STARTING {APP_NAME} (HIGH ACCURACY)...")

print("⏳ Loading Models...")
processor = TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten')
model = VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')
reader = easyocr.Reader(['en'], gpu=False)

try:
    nlp = spacy.load("en_core_web_sm")
except:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")

print(f"✅ READY! Waiting for scans...\n")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        if h > 20 and w > 50: 
            crop = pil_image.crop((x, y, x + w, y + h))
            line_crops.append(crop)
    return line_crops

@app.post("/extract")
async def extract_text(file: UploadFile = File(...), language: str = Form("english")):
    image_bytes = await file.read()
    original_image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    
    # Resize safely
    if original_image.height > 1500:
        scale_factor = 1500 / original_image.height
        new_width = int(original_image.width * scale_factor)
        original_image = original_image.resize((new_width, 1500), Image.Resampling.LANCZOS)

    extracted_data = []

    if language == "english":
        crops = split_image_into_lines(original_image)
        if not crops: crops = [original_image]
        for crop in crops:
            if crop.height < 32: crop = crop.resize((crop.width * 2, crop.height * 2))
            pixel_values = processor(images=crop, return_tensors="pt").pixel_values
            generated_ids = model.generate(pixel_values, max_new_tokens=50, num_beams=3)
            text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()

            if re.search(r'\d+\s+[a-zA-Z]+\s+\d+', text):
                text = text.replace(" ", "").upper()
            
            if len(text) < 2: continue
            
            tag = "Text"
            if "@" in text: tag = "Email"
            elif re.search(r'\d{10}', text): tag = "Phone"
            elif re.match(r'^[A-Z0-9]+$', text) and any(c.isdigit() for c in text): tag = "ID"
            elif re.match(r'^[A-Za-z\s\.]+$', text) and len(text.split()) < 4: tag = "Name"

            extracted_data.append({"text": text, "tag": tag})
    else:
        results = reader.readtext(np.array(original_image))
        for (bbox, text, prob) in results:
            if prob > 0.3: extracted_data.append({"text": text, "tag": "Text"})

    return {"status": "success", "results": extracted_data}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)