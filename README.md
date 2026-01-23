# 🦅 AutoForm-AI (formerly Mosip-FormFalcon)

**AutoForm-AI** is a privacy-first, offline browser extension that uses Deep Learning to extract data from ID cards and auto-fill web forms instantly.

Designed to work as a **Side Panel** (like Copilot), it allows users to drag & drop ID cards, extract text with high accuracy using Transformer models, and fill complex forms with a single click.

![Python](https://img.shields.io/badge/Backend-FastAPI-009688?style=flat-square)
![AI](https://img.shields.io/badge/AI-TrOCR%20%2B%20EasyOCR-orange?style=flat-square)
![Extension](https://img.shields.io/badge/Frontend-Chrome%2FEdge%20Extension-blue?style=flat-square)

---

## 🚀 Key Features

* **🔒 100% Offline & Private:** No data leaves your machine. All processing happens locally.
* **🧠 High-Accuracy AI:** Uses Microsoft's **TrOCR (Transformer OCR)** for handwritten/printed text and **EasyOCR** as a fallback.
* **⚡ Smart Auto-Fill:** Identifies fields like Name, Phone, ID, and Gender on *any* website and fills them automatically.
* **📂 Side Panel UI:** Opens comfortably on the side of your browser for multitasking.
* **✨ Drag & Drop Magic:**
    * Drag your ID card into the extension to upload.
    * Drag extracted text directly into specific form fields.

---

## 🛠️ Tech Stack

* **Backend:** Python 3.9+, FastAPI, Uvicorn, PyTorch, Transformers (Hugging Face), OpenCV.
* **Frontend:** HTML5, CSS3, JavaScript (Manifest V3), Chrome/Edge Side Panel API.

---

## 📦 Installation Guide

### 1. Set up the Brain (Backend)
The backend runs the AI models locally.

```bash
# Clone the repository
git clone [https://github.com/YOUR_USERNAME/AutoForm-AI.git](https://github.com/YOUR_USERNAME/AutoForm-AI.git)
cd AutoForm-AI/backend

# Install dependencies
pip install -r requirements.txt

# Start the Server (Downloads models on first run)
python -m uvicorn main:app --reload