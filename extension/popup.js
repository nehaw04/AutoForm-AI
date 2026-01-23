const scanButton = document.getElementById("scanBtn");
const fileInput = document.getElementById("imageInput");
const dropArea = document.getElementById("dropArea");
const fileName = document.getElementById("fileName");
const resultsDiv = document.getElementById("results");
const statusText = document.getElementById("status");

// --- DRAG & DROP LOGIC (NEW) ---

// 1. Prevent default behavior (browser opening the file)
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// 2. Highlight effect when dragging over
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.style.borderColor = "#007bff";
    dropArea.style.backgroundColor = "#eef6fc";
}

function unhighlight(e) {
    dropArea.style.borderColor = "#bbb";
    dropArea.style.backgroundColor = "#fff";
}

// 3. Handle the Drop
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
        // Assign dropped file to the hidden input
        fileInput.files = files;
        updateUI(files[0]);
    }
}

// --- EXISTING LOGIC ---

// Handle Click to Upload (Classic way)
dropArea.addEventListener("click", () => fileInput.click());

// Handle File Selection (Both Click & Drop end up here)
fileInput.addEventListener("change", () => {
    if (fileInput.files.length > 0) {
        updateUI(fileInput.files[0]);
    }
});

function updateUI(file) {
    fileName.innerText = "📄 " + file.name;
    // Keep the blue border to show success
    dropArea.style.borderColor = "#007bff";
    dropArea.style.backgroundColor = "#f0f8ff";
}

scanButton.addEventListener("click", async () => {
    if (!fileInput.files[0]) {
        statusText.innerText = "⚠️ Select a file first.";
        return;
    }

    resultsDiv.innerHTML = ""; 
    statusText.innerText = "⏳ Analyzing... (High Accuracy Mode)";
    scanButton.disabled = true;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("language", "english");

    try {
        const response = await fetch("http://127.0.0.1:8000/extract", {
            method: "POST",
            body: formData
        });

        if (!response.ok) throw new Error("Server Error");

        const data = await response.json();

        if (data.results && data.results.length > 0) {
            statusText.innerText = "✅ Done! Drag fields to form.";
            data.results.forEach(item => {
                createDraggableCard(item.tag, item.text);
            });
        } else {
            statusText.innerText = "⚠️ No text found.";
        }

    } catch (error) {
        console.error(error);
        statusText.innerText = "❌ Error: Is Python running?";
    } finally {
        scanButton.disabled = false;
        scanButton.innerText = "Scan Document";
    }
});

function createDraggableCard(label, value) {
    const card = document.createElement("div");
    card.className = "result-card";
    card.draggable = true;

    card.addEventListener("dragstart", (e) => {
        e.dataTransfer.setData("text/plain", value);
    });

    card.innerHTML = `
        <div class="label">${label}</div>
        <input type="text" value="${value}">
    `;
    resultsDiv.appendChild(card);
}