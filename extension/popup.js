let currentCandidates = [];

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Restore Saved Data
    chrome.storage.local.get(['savedCandidates'], (result) => {
        if (result.savedCandidates) {
            currentCandidates = result.savedCandidates;
            renderList(currentCandidates);
            document.getElementById('candidateSection').classList.remove('hidden');
        }
    });

    // 2. Setup File Input Visuals (The "Upload" Fix)
    setupFileUpload();

    // 3. Attach Button Listeners
    document.getElementById('extractBtn').addEventListener('click', handleExtract);
    document.getElementById('insertBtn').addEventListener('click', handleInsert);
    document.getElementById('verifyBtn').addEventListener('click', handleVerify);
});

// --- FILE UPLOAD LOGIC ---
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.querySelector('.upload-area');
    const uploadText = document.querySelector('.upload-text');
    const uploadSubtext = document.querySelector('.upload-subtext');

    // Visual: Change text when file is selected
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            uploadText.innerText = "✅ " + fileName;
            uploadText.style.color = "#059669"; 
            uploadText.style.fontWeight = "bold";
            uploadSubtext.style.display = 'none'; // Hide "or drag and drop"
            uploadArea.style.borderColor = "#059669";
            uploadArea.style.backgroundColor = "#ecfdf5";
        }
    });

    // Visual: Dragover Effects
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow dropping
        uploadArea.style.borderColor = "#3b82f6";
        uploadArea.style.backgroundColor = "#eff6ff";
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        if (!fileInput.files.length) {
            uploadArea.style.borderColor = "#cbd5e1";
            uploadArea.style.backgroundColor = "#f8fafc";
        }
    });

    // Visual: Handle Drop explicitly (Fixes "Not Uploading")
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        
        // If user dropped files here manually
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files; // Assign dropped file to input
            // Trigger the change event manually to update UI
            const event = new Event('change');
            fileInput.dispatchEvent(event);
        }
    });
}

// --- MAIN FUNCTIONS ---

async function handleExtract() {
    const fileInput = document.getElementById('fileInput');
    const langSelect = document.getElementById('langSelect');
    const status = document.getElementById('status');
    const listContainer = document.getElementById('listContainer');
    const candidateSection = document.getElementById('candidateSection');

    if (!fileInput.files[0]) { status.innerText = "⚠️ Please select an image first!"; return; }

    status.innerText = "🚀 Scanning... (AI is reading)";
    listContainer.innerHTML = "";
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('language', langSelect.value);

    try {
        const response = await fetch('http://127.0.0.1:8000/extract', { method: 'POST', body: formData });
        const result = await response.json();
        
        currentCandidates = result.candidates;
        chrome.storage.local.set({ 'savedCandidates': currentCandidates });
        renderList(currentCandidates); 
        
        candidateSection.classList.remove('hidden');
        status.innerText = `✅ Found ${currentCandidates.length} items.`;
    } catch (error) {
        console.error(error);
        status.innerText = "❌ Error: Is Python running?";
    }
}

function renderList(candidates) {
    const container = document.getElementById('listContainer');
    container.innerHTML = "";

    if (candidates.length === 0) {
        container.innerHTML = "<div style='text-align:center; color:#999; font-size:12px; padding:10px;'>No text found. Try another image.</div>";
        return;
    }

    candidates.forEach((item, index) => {
        const div = document.createElement('div');
        let color = "#bdc3c7"; 
        if (item.tag === "Name") color = "#2ecc71"; 
        if (item.tag === "Email") color = "#e67e22"; 
        if (item.tag === "Phone") color = "#f1c40f"; 
        if (item.tag === "Address") color = "#9b59b6"; 
        if (item.tag.includes("ID")) color = "#3498db";
        
        div.className = "candidate-row";
        div.style.borderLeft = `4px solid ${color}`;

        // 1. Checkbox
        const checkbox = document.createElement('input');
        checkbox.type = "checkbox";
        checkbox.checked = (item.tag !== "Unknown");
        
        // 2. Editable Text (Drag & Drop)
        const textInput = document.createElement('input');
        textInput.type = "text";
        textInput.value = item.text;
        textInput.className = "candidate-text";
        textInput.setAttribute("draggable", "true");
        
        textInput.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', item.text);
            e.target.style.opacity = '0.5';
        });
        textInput.addEventListener('dragend', (e) => e.target.style.opacity = '1');

        textInput.onchange = (e) => { 
            currentCandidates[index].text = e.target.value; 
            chrome.storage.local.set({ 'savedCandidates': currentCandidates });
        };

        // 3. Colored Tag
        const tagSpan = document.createElement('span');
        tagSpan.innerText = item.tag;
        tagSpan.className = "candidate-tag";
        tagSpan.style.backgroundColor = color;

        // 4. NEW: Delete Button (Trash Icon)
        const deleteBtn = document.createElement('span');
        deleteBtn.innerHTML = "🗑️"; 
        deleteBtn.className = "delete-btn";
        deleteBtn.title = "Remove this field";
        
        deleteBtn.onclick = () => {
            // Remove item from array
            currentCandidates.splice(index, 1);
            // Save new list to storage
            chrome.storage.local.set({ 'savedCandidates': currentCandidates });
            // Re-render the list immediately
            renderList(currentCandidates);
            
            // Update status count
            document.getElementById('status').innerText = `✅ Found ${currentCandidates.length} items.`;
        };

        div.appendChild(checkbox);
        div.appendChild(textInput);
        div.appendChild(tagSpan);
        div.appendChild(deleteBtn); // Add trash icon to row
        container.appendChild(div);
    });
}
async function handleInsert() {
    const checkboxes = document.querySelectorAll('#listContainer input[type="checkbox"]');
    const data = {};

    checkboxes.forEach((cb, index) => {
        if (cb.checked) {
            const item = currentCandidates[index];
            if (item.tag === "Name") data.name = item.text;
            if (item.tag === "Email") data.email = item.text;
            if (item.tag === "Phone") data.phone = item.text;
            if (item.tag === "Age" || item.tag === "DOB") data.age_dob = item.text;
            if (item.tag === "Gender") data.gender = item.text;
            if (item.tag === "Address") data.address1 = item.text;
            if (item.tag === "City/State") data.address2 = item.text;
            if (item.tag === "Pin Code") data.zipcode = item.text;
        }
    });

    try {
        const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
        if (!tab) throw new Error("No webpage found");

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: autoFillForm,
            args: [data]
        });
        document.getElementById('status').innerText = "✨ Data Inserted!";
    } catch (err) {
        document.getElementById('status').innerText = "❌ Permission Error: Check File Access.";
    }
}

function autoFillForm(data) {
    const set = (id, val) => {
        const el = document.getElementById(id);
        if (el && val) { el.value = val; el.style.border = "2px solid #27ae60"; }
    };
    set('fullName', data.name);
    set('age_dob', data.age_dob);
    set('gender', data.gender);
    set('address1', data.address1);
    set('address2', data.address2);
    set('zipcode', data.zipcode);
    set('phone', data.phone);
    set('email', data.email);
}

async function handleVerify() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
    const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            const get = (id) => document.getElementById(id) ? document.getElementById(id).value : "";
            return {
                name: get('fullName'),
                age_dob: get('age_dob'),
                gender: get('gender'),
                address1: get('address1'),
                address2: get('address2'),
                zipcode: get('zipcode'),
                phone: get('phone'),
                email: get('email')
            };
        }
    });

    const currentFormData = result[0].result;
    
    // Construct OCR Data Object from candidates
    const ocrData = {};
    currentCandidates.forEach(c => {
        if(c.tag === "Name") ocrData.name = c.text;
        if(c.tag === "Email") ocrData.email = c.text;
        if(c.tag === "Phone") ocrData.phone = c.text;
    });

    const response = await fetch('http://127.0.0.1:8000/verify', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ ocr_data: ocrData, form_data: currentFormData })
    });
    
    const ver = await response.json();
    alert(`Verdict: ${ver.verdict} (${ver.overall_score}%)`);
}