document.addEventListener("DOMContentLoaded", () => {
    // UI Elements
    const autofillBtn = document.getElementById("autofill-btn");
    const vaultList = document.getElementById("vault-list");
    const rulesList = document.getElementById("rules-list");
    
    // Tabs
    const tabVaultBtn = document.getElementById("tab-vault-btn");
    const tabRulesBtn = document.getElementById("tab-rules-btn");
    const viewVault = document.getElementById("view-vault");
    const viewRules = document.getElementById("view-rules");

    // Add Form
    const addBtn = document.getElementById("add-btn");
    const newKeyInput = document.getElementById("new-key");
    const newValInput = document.getElementById("new-val");

    // --- TAB SWITCHING ---
    tabVaultBtn.addEventListener("click", () => {
        tabVaultBtn.classList.add("active");
        tabRulesBtn.classList.remove("active");
        viewVault.style.display = "block";
        viewRules.style.display = "none";
        loadData();
    });

    tabRulesBtn.addEventListener("click", () => {
        tabRulesBtn.classList.add("active");
        tabVaultBtn.classList.remove("active");
        viewRules.style.display = "block";
        viewVault.style.display = "none";
        loadData();
    });

    // --- DATA LOADING & RENDERING ---
    function loadData() {
        chrome.storage.local.get(["vaultData", "learnedMappings"], (result) => {
            renderVault(result.vaultData || {});
            renderRules(result.learnedMappings || {});
        });
    }
    async function uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        const response = await fetch("http://localhost:8000/extract", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        
        if (result.status === "success") {
            // Save the extracted data into the Vault
            chrome.storage.local.get("vaultData", (data) => {
                let currentVault = data.vaultData || {};
                // Merge new data
                let updatedVault = { ...currentVault, ...result.data };
                chrome.storage.local.set({ vaultData: updatedVault }, () => {
                    alert("Resume Synced to Vault!");
                    location.reload(); // Refresh UI
                });
            });
        }
    } catch (error) {
        console.error("Connection to backend failed:", error);
        alert("Make sure your Python backend is running!");
    }
}

    function renderVault(vault) {
        vaultList.innerHTML = "";
        if (Object.keys(vault).length === 0) {
            vaultList.innerHTML = `<div class="empty-state">Vault is empty.<br>Add data below.</div>`;
            return;
        }
        
        for (const [key, value] of Object.entries(vault)) {
            let displayKey = key.replace(/_/g, " "); 
            
            let div = document.createElement("div");
            div.className = "item-row";
            div.innerHTML = `
                <span class="item-key" title="${displayKey}">${displayKey}</span> 
                <span class="item-val" title="${value}">${value}</span>
                <div class="actions">
                    <button class="action-btn edit-vault" data-key="${key}">✏️</button>
                    <button class="action-btn del-vault" data-key="${key}">🗑️</button>
                </div>
            `;
            vaultList.appendChild(div);
        }
    }
    

    function renderRules(rules) {
        rulesList.innerHTML = "";
        if (Object.keys(rules).length === 0) {
            rulesList.innerHTML = `<div class="empty-state">No rules learned yet.<br>Type in web forms to teach the AI.</div>`;
            return;
        }

        for (const [label, mappedKey] of Object.entries(rules)) {
            let div = document.createElement("div");
            div.className = "item-row";
            div.innerHTML = `
                <span class="item-key" title="${label}">${label}</span> 
                <span>➔</span>
                <span class="item-val" title="${mappedKey}">${mappedKey}</span>
                <div class="actions">
                    <button class="action-btn del-rule" data-label="${label}">🗑️</button>
                </div>
            `;
            rulesList.appendChild(div);
        }
    }

    // --- EVENT DELEGATION FOR EDIT/DELETE BUTTONS ---
    document.addEventListener("click", (e) => {
        // Delete Vault Item
        if (e.target.classList.contains("del-vault")) {
            const key = e.target.getAttribute("data-key");
            chrome.storage.local.get(["vaultData"], (res) => {
                let vault = res.vaultData || {};
                delete vault[key];
                chrome.storage.local.set({ vaultData: vault }, loadData);
            });
        }

        // Edit Vault Item
        if (e.target.classList.contains("edit-vault")) {
            const key = e.target.getAttribute("data-key");
            chrome.storage.local.get(["vaultData"], (res) => {
                let vault = res.vaultData || {};
                let newVal = prompt(`Edit value for "${key}":`, vault[key]);
                if (newVal !== null && newVal.trim() !== "") {
                    vault[key] = newVal.trim();
                    chrome.storage.local.set({ vaultData: vault }, loadData);
                }
            });
        }

        // Delete Learned Rule
        if (e.target.classList.contains("del-rule")) {
            const label = e.target.getAttribute("data-label");
            chrome.storage.local.get(["learnedMappings"], (res) => {
                let mappings = res.learnedMappings || {};
                delete mappings[label];
                chrome.storage.local.set({ learnedMappings: mappings }, loadData);
            });
        }
    });
    document.getElementById('captureBtn').addEventListener('click', async () => {
        // 1. Get the active tab
        let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

        // 2. Execute a script to "Read" the form
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => {
                const inputs = document.querySelectorAll('input, textarea, select');
                let capturedData = {};

                inputs.forEach(input => {
                    // Only save if the user actually typed something
                    if (input.value && input.name || input.id) {
                        const key = input.name || input.id;
                        capturedData[key] = input.value;
                    }
                });
                return capturedData;
            }
        }, (injectionResults) => {
            for (const frameResult of injectionResults) {
                const newData = frameResult.result;
                
                // 3. Save the captured data into the Vault
                chrome.storage.local.get("vaultData", (data) => {
                    let currentVault = data.vaultData || {};
                    let updatedVault = { ...currentVault, ...newData };
                    
                    chrome.storage.local.set({ vaultData: updatedVault }, () => {
                        alert(`Saved ${Object.keys(newData).length} new items to Vault!`);
                    });
                });
            }
        });
    });

    // --- ADD MANUAL DATA ---
    addBtn.addEventListener("click", () => {
        let key = newKeyInput.value.trim().toLowerCase().replace(/\s+/g, "_");
        let val = newValInput.value.trim();

        if (!key || !val) return;

        chrome.storage.local.get(["vaultData"], (result) => {
            let vault = result.vaultData || {};
            vault[key] = val;
            chrome.storage.local.set({ vaultData: vault }, () => {
                newKeyInput.value = "";
                newValInput.value = "";
                loadData();
            });
        });
    });

    // --- TRIGGER AUTO-FILL ---
    autofillBtn.addEventListener("click", () => {
        const originalText = autofillBtn.innerText;
        autofillBtn.innerText = "⏳ Processing...";
        autofillBtn.disabled = true;

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (!tabs[0]) return;
            chrome.tabs.sendMessage(tabs[0].id, { action: "trigger_autofill" }, (response) => {
                if (chrome.runtime.lastError) {
                    autofillBtn.innerText = "⚠️ Refresh webpage first";
                } else {
                    autofillBtn.innerText = "✅ Fill Command Sent";
                }
                setTimeout(() => {
                    autofillBtn.innerText = originalText;
                    autofillBtn.disabled = false;
                }, 2000);
            });
        });
    });

    // This is the "Link" between the HTML and the Logic
document.getElementById('resumeUpload').addEventListener('change', async (event) => {
    const file = event.target.files[0]; // Get the file the user picked
    if (file) {
        // Show a loading state (optional but nice)
        console.log("Reading file:", file.name);
        
        // Call the function we wrote earlier
        await uploadResume(file); 
    }
});

// The actual logic that talks to your Python Backend
async function uploadResume(file) {
    const formData = new FormData();
    formData.append("file", file);

    try {
        // Ensure your Python backend (main.py) is running on port 8000!
        const response = await fetch("http://localhost:8000/extract", {
            method: "POST",
            body: formData
        });

        const result = await response.json();
        
        if (result.status === "success") {
            // Save the extracted data into Chrome's Local Storage (The Vault)
            chrome.storage.local.get("vaultData", (data) => {
                let currentVault = data.vaultData || {};
                
                // Merge new data from Resume into your current Vault
                let updatedVault = { ...currentVault, ...result.data };
                
                chrome.storage.local.set({ vaultData: updatedVault }, () => {
                    alert("✅ Success! Resume data synced to Vault.");
                    window.location.reload(); // Refresh the popup to show new data
                });
            });
        }
    } catch (error) {
        console.error("Connection failed:", error);
        alert("❌ Error: Is your Python Backend running?");
    }
}

    // Initial Load
    loadData();
});