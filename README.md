# MOSIP Intelligent OCR & Verification Tool 🕵️‍♂️🆔

A secure, offline-first browser extension that automates form filling for MOSIP registration. It uses local AI models to extract text from handwritten or printed IDs, verifies data integrity, and ensures privacy by strictly avoiding cloud APIs.

## 🚀 Key Features
* **🚫 100% Offline/Local:** Uses **TrOCR** (Microsoft) and **Spacy** running locally. No data ever leaves the user's machine.
* **✍️ Handwriting Support:** Capable of reading messy handwritten forms and IDs.
* **🧠 Context Awareness:** Automatically detects if a document is a **Government ID** or **Student ID**.
* **✅ Auto-Verification:** Verifies auto-filled data against the original image using Fuzzy Logic to detect tampering or typos.
* **📸 Quality Control:** Instantly detects blurry or dark scans using OpenCV and warns the user.
* **🖱️ Human-in-the-Loop:** "Select-to-Fill" interface allows users to pick exactly which text to insert.

## 🛠️ Tech Stack
* **Frontend:** HTML5, CSS3, JavaScript (Chrome Manifest V3)
* **Backend:** Python 3.9+, FastAPI, Uvicorn
* **AI/ML:** * *OCR:* `microsoft/trocr-base-handwritten` (Hugging Face)
    * *NER:* `spacy` (en_core_web_sm)
    * *Computer Vision:* OpenCV (Line segmentation & Blur detection)
    * *Verification:* TheFuzz (Levenshtein Distance)

---

## ⚙️ Installation Guide

### Prerequisites
* Python 3.8 or higher
* Google Chrome or Microsoft Edge
* 4GB+ RAM (for running TrOCR model)

### 1. Backend Setup (The Brain)
```bash
# Clone the repository
git clone [https://github.com/your-username/mosip-ocr-tool.git](https://github.com/your-username/mosip-ocr-tool.git)
cd mosip-ocr-tool/backend

# Create Virtual Environment
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install Dependencies
pip install fastapi uvicorn python-multipart transformers torch pillow thefuzz opencv-python spacy

# Download Spacy Model (One time only)
python -m spacy download en_core_web_sm

# Start the Server
python main.py