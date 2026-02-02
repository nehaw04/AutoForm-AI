<div align="center">
  <h1>🦅 AutoForm-AI</h1>
  <h3>Smart. Secure. Instant.</h3>
  <p>Fill web forms in seconds with AI-powered ID card scanning</p>

  <p>
    <a href="#-what-is-autoform-ai">Features</a> •
    <a href="#-see-it-in-action">Demo</a> •
    <a href="#-quick-start">Quick Start</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-contributing">Contributing</a>
  </p>

  <img src="screenshots/hero-banner.png" alt="AutoForm-AI Hero" width="800"/>
</div>

---

### 💡 What is AutoForm-AI?
**AutoForm-AI** is a privacy-first browser extension that uses a **Hybrid AI Engine** to extract information from ID cards and automatically fill web forms. Think of it as your personal data entry assistant that works entirely offline!

<table>
  <tr>
    <td width="33%" align="center">
      <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/lock.svg" width="50" height="50"/>
      <h3>🔒 100% Private</h3>
      <p>All processing happens locally on your device. Zero data transmission to the cloud.</p>
    </td>
    <td width="33%" align="center">
      <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/bolt.svg" width="50" height="50"/>
      <h3>⚡ Efficient Inference</h3>
      <p>Optimized local pipeline extracts and fills forms in seconds.</p>
    </td>
    <td width="33%" align="center">
      <img src="https://raw.githubusercontent.com/FortAwesome/Font-Awesome/6.x/svgs/solid/wand-magic-sparkles.svg" width="50" height="50"/>
      <h3>🎯 Smart Detection</h3>
      <p>Intelligently identifies semantic form fields (Name, Email, Phone) on standard websites.</p>
    </td>
  </tr>
</table>

---

### 🌟 What Makes It Special?

<details open>
<summary><b>🧠 Hybrid AI Architecture</b></summary>
<br>
<ul>
  <li><b>TrOCR (Microsoft):</b> specialized Transformer model for high-accuracy handwriting recognition.</li>
  <li><b>EasyOCR:</b> Efficient fallback engine for printed text and noisy backgrounds.</li>
  <li><b>NLP + Regex Engine:</b> Combines SpaCy for context understanding with Regex for precise extraction of structured data (Emails, Phones, IDs).</li>
</ul>
</details>

<details open>
<summary><b>🎨 Seamless User Experience</b></summary>
<br>
<ul>
  <li><b>Extension Popup:</b> Clean, intuitive side-panel interface.</li>
  <li><b>Drag & Drop:</b> Upload ID cards with a simple drag gesture.</li>
  <li><b>Visual Validation:</b> Review extracted data in organized cards before filling.</li>
  <li><b>One-Click Fill:</b> Auto-detects standard HTML form attributes to fill data instantly.</li>
</ul>
</details>

<details open>
<summary><b>🛡️ Privacy & Control</b></summary>
<br>
<ul>
  <li><b>Offline-First:</b> No internet required for the AI backend.</li>
  <li><b>No Tracking:</b> Zero analytics or data collection.</li>
  <li><b>Full Control:</b> Delete incorrect extractions via the UI before they touch a form.</li>
</ul>
</details>

---

### 🎬 See It in Action

#### Step 1: Scan Your ID Card
<div align="center">
  <img src="screenshots/scan.png" alt="Scanning Interface" width="700"/>
  <p><i>Drag and drop your ID card. The AI pre-processes the image and extracts relevant text.</i></p>
</div>

<br>

#### Step 2: Review & Edit
<div align="center">
  <img src="screenshots/review.png" alt="Data Review" width="700"/>
  <p><i>Check extracted data and remove any incorrect fields with individual delete buttons.</i></p>
</div>

<br>

#### Step 3: Auto-Fill Any Form
<div align="center">
  <img src="screenshots/demo.png" alt="Form Filling" width="700"/>
  <p><i>Click "Auto-Fill" or drag individual data cards directly into form fields.</i></p>
</div>

---

### 🚀 Quick Start

#### Prerequisites
* **Python 3.9+** installed on your system
* **Google Chrome** or **Microsoft Edge** browser
* **Docker** (Optional, for containerized backend)

---

#### 🐳 Option A: Docker (Recommended)
The cleanest way to run the AI backend without dependency conflicts.

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/AutoForm-AI.git
cd AutoForm-AI

# 2. Launch Backend
cd backend
docker-compose up

# 3. Backend is ready at http://localhost:8000
```

> ✅ **AI models download automatically on first run (~500MB)**

---

#### 💻 Option B: Manual Installation

<details>
<summary><b>🔽 Click to expand manual setup instructions</b></summary>

<br>

**Backend Setup**

```bash
# 1. Navigate to backend directory
cd backend

# 2. Create virtual environment
python -m venv venv

# 3. Activate it
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# 4. Install dependencies
pip install -r requirements.txt

# 5. Start the server
uvicorn main:app --reload
```

✅ Backend running at `http://localhost:8000`

**Extension Installation**

```bash
# 1. Open Chrome/Edge and go to:
chrome://extensions/   (or edge://extensions/)

# 2. Enable "Developer mode" (toggle in top-right)

# 3. Click "Load unpacked"

# 4. Select the 'extension' folder from this repo

# 5. Pin the extension to your toolbar
```

✅ Extension installed! Look for the 🦅 icon in your browser.

</details>

---

### 🎯 How to Use

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

### 🧰 Tech Stack

<div align="center">

#### Backend (The Brain 🧠)

| Technology | Purpose | Why? |
|------------|---------|------|
| **FastAPI** | REST API Framework | Blazing fast, async support, auto docs |
| **TrOCR** | Handwriting Recognition | State-of-the-art transformer model from Microsoft |
| **EasyOCR** | Printed Text Recognition | 80+ language support, highly accurate |
| **Spacy** | NLP & Entity Extraction | Intelligent parsing of names, dates, etc. |
| **OpenCV** | Image Preprocessing | Denoising, deskewing, contrast enhancement |
| **Pillow** | Image Handling | Format conversion and manipulation |

#### Frontend (The Interface 🎨)

| Technology | Purpose | Why? |
|------------|---------|------|
| **Manifest V3** | Extension Framework | Latest Chrome standard, secure |
| **Vanilla JS** | Logic & API Calls | Lightweight, no bloat |
| **CSS3** | Responsive UI | Modern styling with flexbox/grid |
| **Chrome APIs** | Form Interaction | Native browser integration |

</div>

---

### 📁 Project Structure

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

### 🎨 API Endpoints

| Endpoint | Method | Description | Response |
|----------|--------|-------------|----------|
| `/` | GET | Health check | `{"message": "AutoForm-AI is running!"}` |
| `/extract` | POST | Extract text from ID card image | `{"name": "...", "phone": "...", ...}` |
| `/health` | GET | System status | `{"status": "healthy", "models": "loaded"}` |

#### Example API Call

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

### 🤝 Contributing

We love contributions! Here's how you can help:

<table>
<tr>
<td width="50%">

#### 🐛 Found a Bug?

1. Check [existing issues](https://github.com/YOUR_USERNAME/AutoForm-AI/issues)
2. Create a new issue with:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots (if applicable)

</td>
<td width="50%">

#### 💡 Have an Idea?

1. Open a [feature request](https://github.com/YOUR_USERNAME/AutoForm-AI/issues/new)
2. Describe your idea clearly
3. Explain the use case
4. We'll discuss together!

</td>
</tr>
</table>

#### 🔧 Pull Request Process

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

### 🛣️ Roadmap

- [x] Core OCR functionality with TrOCR
- [x] Browser extension with popup interface
- [x] Drag & drop upload
- [x] Auto-fill detection
- [ ] Support for more ID card formats (Passport, Driver's License)
- [ ] Multi-language support (Spanish, French, German)
- [ ] Firefox extension
- [ ] Batch processing mode
- [ ] Mobile app version

---

### ⚠️ Known Limitations

- **Image Quality:** Works best with clear, well-lit images (300+ DPI recommended)
- **Handwriting Styles:** Very stylized cursive may reduce accuracy
- **Language Support:** Currently optimized for English text
- **Form Detection:** May not work on heavily customized/dynamic forms

---

### 📜 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

**TL;DR:** You can use, modify, and distribute this freely. Just give credit! 🙏

---

### 🙏 Acknowledgments

- **Microsoft Research** - TrOCR transformer model
- **Jaided AI** - EasyOCR library
- **Hugging Face** - Model hosting and transformers library
- **FastAPI Community** - Amazing async framework
- **You!** - For checking out this project ❤️

---

<div align="center">

### 🌟 Show Your Support

If this project helped you, please consider:

[![Star on GitHub](https://img.shields.io/github/stars/YOUR_USERNAME/AutoForm-AI?style=social)](https://github.com/YOUR_USERNAME/AutoForm-AI)
[![Fork on GitHub](https://img.shields.io/github/forks/YOUR_USERNAME/AutoForm-AI?style=social)](https://github.com/YOUR_USERNAME/AutoForm-AI/fork)

**Built with 💙 by [Your Name](https://github.com/YOUR_USERNAME)**

[Report Bug](https://github.com/YOUR_USERNAME/AutoForm-AI/issues) • [Request Feature](https://github.com/YOUR_USERNAME/AutoForm-AI/issues) • [Ask Question](https://github.com/YOUR_USERNAME/AutoForm-AI/discussions)

---

*"Simplifying web forms, one ID card at a time."* 🦅

</div>
