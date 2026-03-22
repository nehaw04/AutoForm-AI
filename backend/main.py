from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import pdfplumber
import spacy
from spacy.pipeline import EntityRuler
import pytesseract

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



# Load a small, fast NLP model
nlp = spacy.load("en_core_web_sm")

# Add a "Ruler" to recognize specific skills without heavy training
ruler = nlp.add_pipe("entity_ruler", before="ner")
patterns = [
    {"label": "SKILL", "pattern": "Python"},
    {"label": "SKILL", "pattern": "Machine Learning"},
    {"label": "SKILL", "pattern": "Artificial Intelligence"},
    {"label": "SKILL", "pattern": "Salesforce"},
    {"label": "ORG", "pattern": "VIT Bhopal"},
]
ruler.add_patterns(patterns)
@app.get("/")
async def health_check():
    return {
        "status": "online",
        "system": "AutoForm-AI Commercial Vector Brain",
        "owner": "Neha R"
    }

@app.post("/extract")
async def extract_resume_data(file: UploadFile = File(...)):
    text = ""
    with pdfplumber.open(file.file) as pdf:
        for page in pdf.pages:
            text += page.extract_text()

    doc = nlp(text)
    
    # Organize extracted data for the Vault
    vault_updates = {}
    for ent in doc.ents:
        if ent.label_ == "SKILL":
            if "skills" not in vault_updates: vault_updates["skills"] = []
            vault_updates["skills"].append(ent.text)
        elif ent.label_ == "ORG":
            vault_updates["university"] = ent.text

    return {"status": "success", "data": vault_updates}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)