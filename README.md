<div align="center">

# 🦅 AutoForm-AI

### *Smart. Secure. Instant.*

**Fill web forms in seconds with AI-powered ID card scanning**

[![Python](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![AI](https://img.shields.io/badge/AI-TrOCR%20%2B%20EasyOCR-FF6F00?style=for-the-badge&logo=pytorch&logoColor=white)](https://huggingface.co/microsoft/trocr-base-handwritten)
[![Extension](https://img.shields.io/badge/Browser-Chrome%20%7C%20Edge-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-00C853?style=for-the-badge)](LICENSE)

[Features](#-what-makes-it-special) • [Demo](#-see-it-in-action) • [Quick Start](#-quick-start) • [Tech Stack](#-tech-stack) • [Contributing](#-contributing)

<img src="screenshots/hero-banner.png" alt="AutoForm-AI Hero" width="800"/>

---

</div>

## 💡 What is AutoForm-AI?

AutoForm-AI is a **privacy-first browser extension** that uses cutting-edge Deep Learning to extract information from ID cards and automatically fill web forms. Think of it as your personal data entry assistant that works entirely offline!

<table>
<tr>
<td width="33%" align="center">
<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/lock.svg" width="50" height="50"/>
<h3>🔒 100% Private</h3>
<p>All processing happens locally on your device. Zero data transmission.</p>
</td>
<td width="33%" align="center">
<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/bolt.svg" width="50" height="50"/>
<h3>⚡ Lightning Fast</h3>
<p>Extract and fill forms in under 3 seconds with transformer models.</p>
</td>
<td width="33%" align="center">
<img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/wand-magic-sparkles.svg" width="50" height="50"/>
<h3>🎯 Smart Detection</h3>
<p>Automatically identifies form fields on any website.</p>
</td>
</tr>
</table>

---

## 🌟 What Makes It Special?

<details open>
<summary><b>🧠 Dual AI Engine</b></summary>
<br>

- **TrOCR (Microsoft):** Advanced transformer model for handwritten text with 95%+ accuracy
- **EasyOCR:** Robust fallback for printed text and challenging images
- **Spacy NLP:** Intelligent entity recognition for names, phones, emails

</details>

<details open>
<summary><b>🎨 Seamless User Experience</b></summary>
<br>

- **Extension Popup:** Clean, intuitive interface accessible with one click
- **Drag & Drop:** Upload ID cards with a simple drag gesture
- **Visual Feedback:** See extracted data in organized, editable cards
- **One-Click Fill:** Auto-detect and fill forms across any website

</details>

<details open>
<summary><b>🛡️ Privacy & Control</b></summary>
<br>

- **Offline-First:** No internet required after setup
- **No Tracking:** Zero analytics or data collection
- **Full Control:** Delete incorrect extractions before filling
- **Open Source:** Audit the code yourself

</details>

---

## 🎬 See It in Action

### Step 1: Scan Your ID Card
<div align="center">
<img src="screenshots/scan.png" alt="Scanning Interface" width="700"/>

*Drag and drop your ID card. The AI extracts all relevant information in seconds.*
</div>

<br>

### Step 2: Review & Edit
<div align="center">
<img src="screenshots/review.png" alt="Data Review" width="700"/>

*Check extracted data and remove any incorrect fields with individual delete buttons.*
</div>

<br>

### Step 3: Auto-Fill Any Form
<div align="center">
<img src="screenshots/demo.png" alt="Form Filling" width="700"/>

*Click "Auto-Fill" or drag individual data cards directly into form fields.*
</div>

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.9+** installed on your system
- **Google Chrome** or **Microsoft Edge** browser
- **Docker** (optional, but recommended)

---

### 🐳 Option A: Docker (Easiest Way)

Perfect if you want zero setup hassle!

```bash
# 1️⃣ Clone the repository
git clone https://github.com/YOUR_USERNAME/AutoForm-AI.git
cd AutoForm-AI

# 2️⃣ Navigate to backend and launch Docker
cd backend
docker-compose up

# 3️⃣ Backend is ready at http://localhost:8000
```

> ✅ **That's it!** The AI models will download automatically on first run (~500MB).

---

### 💻 Option B: Manual Installation

For developers who want full control:

<details>
<summary><b>🔽 Click to expand manual setup instructions</b></summary>

#### **Backend Setup**

```bash
# 1️⃣ Navigate to backend directory
cd backend

# 2️⃣ Create virtual environment
python -m venv venv

# 3️⃣ Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4️⃣ Install dependencies
pip install -r requirements.txt

# 5️⃣ Download required models (first run only)
python -c "from transformers import TrOCRProcessor, VisionEncoderDecoderModel; \
           TrOCRProcessor.from_pretrained('microsoft/trocr-base-handwritten'); \
           VisionEncoderDecoderModel.from_pretrained('microsoft/trocr-base-handwritten')"

# 6️⃣ Start the server
uvicorn main:app --reload
```

✅ Backend running at `http://localhost:8000`

#### **Extension Installation**

```bash
# 1️⃣ Open Chrome/Edge and go to:
chrome://extensions/   (or edge://extensions/)

# 2️⃣ Enable "Developer mode" (toggle in top-right)

# 3️⃣ Click "Load unpacked"

# 4️⃣ Select the 'extension' folder from this repo

# 5️⃣ Pin the extension to your toolbar
```

✅ Extension installed! Look for the 🦅 icon in your browser.

</details>

---

## 🎯 How to Use

1. **📸 Open the Extension**
   - Click the AutoForm-AI icon (🦅) in your browser toolbar
   - The popup window opens instantly

2. **🖼️ Upload ID Card**
   - Drag & drop an image, or click to browse
   - Supported: JPG, PNG, JPEG (max 5MB)

3. **✨ AI Extraction**
   - Wait 2-3 seconds while AI processes
   - Review extracted fields (Name, Phone, ID, Gender, Email)

4. **✏️ Verify Data**
   - Click ❌ on any card to delete incorrect data
   - Data stays private in your browser

5. **🚀 Fill Forms**
   - Navigate to any form on the web
   - Click "Auto-Fill" button, or
   - Drag individual cards into specific fields

---

## 🧰 Tech Stack

<div align="center">

### Backend (The Brain 🧠)

| Technology | Purpose | Why? |
|------------|---------|------|
| **FastAPI** | REST API Framework | Blazing fast, async support, auto docs |
| **TrOCR** | Handwriting Recognition | State-of-the-art transformer model from Microsoft |
| **EasyOCR** | Printed Text Recognition | 80+ language support, highly accurate |
| **Spacy** | NLP & Entity Extraction | Intelligent parsing of names, dates, etc. |
| **OpenCV** | Image Preprocessing | Denoising, deskewing, contrast enhancement |
| **Pillow** | Image Handling | Format conversion and manipulation |

### Frontend (The Interface 🎨)

| Technology | Purpose | Why? |
|------------|---------|------|
| **Manifest V3** | Extension Framework | Latest Chrome standard, secure |
| **Vanilla JS** | Logic & API Calls | Lightweight, no bloat |
| **CSS3** | Responsive UI | Modern styling with flexbox/grid |
| **Chrome APIs** | Form Interaction | Native browser integration |

</div>

---

## 📁 Project Structure

```
AutoForm-AI/
│
├── 📂 backend/                 # Python AI backend
│   ├── main.py                 # FastAPI application entry point
│   ├── requirements.txt        # Python dependencies (TrOCR, EasyOCR, FastAPI)
│   ├── Dockerfile              # Backend container configuration
│   └── docker-compose.yml      # Multi-container orchestration
│
├── 📂 extension/               # Browser extension (Manifest V3)
│   ├── manifest.json           # Extension metadata & permissions
│   ├── popup.html              # Extension popup interface
│   ├── popup.js                # Popup logic & API communication
│   ├── content.js              # Injected script for form detection
│   └── service-worker.js       # Background service worker
│
├── 📂 screenshots/             # Demo images for README
│
├── .gitignore                  # Git ignore rules
├── test.html                   # Sample form for testing
├── LICENSE                     # MIT License
└── README.md                   # You are here! 📍
```

---

## 🎨 API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Health check | `{"message": "AutoForm-AI is running!"}` |
| `/extract` | POST | Extract text from ID card image | `{"name": "...", "phone": "...", ...}` |
| `/health` | GET | System status | `{"status": "healthy", "models": "loaded"}` |

### Example API Call

```javascript
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8000/extract', {
  method: 'POST',
  body: formData
});

const data = await response.json();
console.log(data); // { name: "John Doe", phone: "123-456-7890", ... }
```

---

## 🤝 Contributing

We love contributions! Here's how you can help:

<table>
<tr>
<td width="50%">

### 🐛 Found a Bug?

1. Check [existing issues](https://github.com/YOUR_USERNAME/AutoForm-AI/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

</td>
<td width="50%">

### 💡 Have an Idea?

1. Open a [feature request](https://github.com/YOUR_USERNAME/AutoForm-AI/issues/new)
2. Describe your idea clearly
3. Explain the use case
4. We'll discuss together!

</td>
</tr>
</table>

### 🔧 Pull Request Process

```bash
# 1. Fork the repo
# 2. Create a feature branch
git checkout -b feature/amazing-feature

# 3. Make your changes
# 4. Commit with clear messages
git commit -m "Add amazing feature X"

# 5. Push to your fork
git push origin feature/amazing-feature

# 6. Open a Pull Request
```

---

## 🛣️ Roadmap

- [x] Core OCR functionality with TrOCR
- [x] Browser extension with side panel
- [x] Drag & drop upload
- [x] Auto-fill detection
- [ ] Support for more ID card formats (Passport, Driver's License)
- [ ] Multi-language support (Spanish, French, German)
- [ ] Firefox extension
- [ ] Batch processing mode
- [ ] Cloud sync (optional, encrypted)
- [ ] Mobile app version

---

## ⚠️ Known Limitations

- **Image Quality:** Works best with clear, well-lit images (300+ DPI recommended)
- **Handwriting Styles:** Very stylized cursive may reduce accuracy
- **Language Support:** Currently optimized for English text
- **Form Detection:** May not work on heavily customized/dynamic forms

---

## 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this freely. Just give credit! 🙏

---

## 🙏 Acknowledgments

- **Microsoft Research** - TrOCR transformer model
- **Jaided AI** - EasyOCR library
- **Hugging Face** - Model hosting and transformers library
- **FastAPI Community** - Amazing async framework
- **You!** - For checking out this project ❤️

---

<div align="center">

## 🌟 Show Your Support

If this project helped you, please consider:

[![Star on GitHub](https://img.shields.io/github/stars/YOUR_USERNAME/AutoForm-AI?style=social)](https://github.com/YOUR_USERNAME/AutoForm-AI)
[![Fork on GitHub](https://img.shields.io/github/forks/YOUR_USERNAME/AutoForm-AI?style=social)](https://github.com/YOUR_USERNAME/AutoForm-AI/fork)

**Built with 💙 by [Your Name](https://github.com/YOUR_USERNAME)**

[Report Bug](https://github.com/YOUR_USERNAME/AutoForm-AI/issues) • [Request Feature](https://github.com/YOUR_USERNAME/AutoForm-AI/issues) • [Ask Question](https://github.com/YOUR_USERNAME/AutoForm-AI/discussions)

---

*"Simplifying web forms, one ID card at a time."* 🦅

</div>
