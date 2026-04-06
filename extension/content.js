console.log("🚨 AUTOFORM-AI: CONTENT SCRIPT INJECTED!");

// --- 1. THE SCRAPER UTILITY ---
// Finds the true label for any input box
// --- 1. THE SUPER SCRAPER (Google Forms + Job Portals) ---
// --- 1. THE SCRAPER UTILITY ---
function getLabelForInput(element) {
    // 1. Check standard attributes (aria-label, placeholder)
    let label = element.getAttribute("aria-label") || element.placeholder || "";
    
    // 2. Google Forms Special: Check aria-labelledby
    if (!label) {
        let labelledBy = element.getAttribute("aria-labelledby");
        if (labelledBy) {
            let labelElem = document.getElementById(labelledBy.split(' ')[0]);
            if (labelElem) label = labelElem.innerText;
        }
    }

    // 3. Check for standard <label> tags
    if (!label && element.id) {
        let labelElem = document.querySelector(`label[for='${element.id}']`);
        if (labelElem) label = labelElem.innerText;
    }
    
    // --- UPDATED STEP 4: SMART CONTAINER CRAWL ---
    if (!label) {
        // Look for the closest container that likely holds a question title
        let container = element.closest('[role="listitem"]') || 
                        element.closest('[data-params]') || 
                        element.closest('div.flex') || // Added for modern layouts like Unstop
                        element.parentElement;
        
        if (container) {
            // Priority 1: Look for explicit labels or headings
            // Priority 2: If no heading, take the FIRST piece of text found in the container
            let titleElem = container.querySelector('div[role="heading"], span, label, p');
            
            if (titleElem && titleElem.innerText.trim().length > 0) {
                label = titleElem.innerText;
            } else {
                // Fallback: Just grab the text of the container itself, but stop at the first newline
                label = container.innerText.split('\n')[0];
            }
        }
    }
    
    // FINAL SAFETY: If the label is just a random number/ID (like your screenshot), 
    // and we found nothing better, return empty so the AI can try to guess later.
    if (label && (label.length > 20 || /\d/.test(label) && label.includes('-'))) {
        // This looks like a UUID or a messy ID, ignore it.
        label = ""; 
    }

    return label ? label.replace(/\*/g, '').trim().toLowerCase() : "";
}

// --- 2. THE OBSERVER (LEARNING MODE) ---
// Listens every time you click away from a text box
document.addEventListener("blur", (event) => {
    let input = event.target;
    if (input.tagName !== "INPUT" || !input.value) return;

    let typedValue = input.value.trim().toLowerCase();
    let labelText = getLabelForInput(input);

    if (labelText) {
        chrome.storage.local.get(["vaultData", "learnedMappings"], (result) => {
            let vault = result.vaultData || {};
            let mappings = result.learnedMappings || {};
            
            // Check if what you typed matches any saved value in your Vault
            for (const [vaultKey, savedValue] of Object.entries(vault)) {
                if (savedValue.toLowerCase() === typedValue) {
                    
                    // If it's a new label, learn it and save it silently
                    if (mappings[labelText] !== vaultKey) {
                        mappings[labelText] = vaultKey;
                        chrome.storage.local.set({ learnedMappings: mappings });
                        console.log(`🧠 Learned Rule: "${labelText}" maps to [${vaultKey}]`);
                    }
                    break;
                }
            }
        });
    }
}, true); // 'true' uses the capture phase to ensure no webpage scripts block this

// --- 3. THE INJECTOR (AUTO-FILL MODE) ---
// Triggered when you click the Auto-Fill button in your extension popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "trigger_autofill") {
        
        chrome.storage.local.get(["vaultData", "learnedMappings"], (result) => {
            let vault = result.vaultData || {};
            let mappings = result.learnedMappings || {};
            let vaultKeys = Object.keys(vault);
            
            if (vaultKeys.length === 0) {
                alert("Your Vault is empty. Save some data first!");
                return;
            }

            let inputs = document.querySelectorAll("input:not([type='hidden']):not([type='submit'])");
            let scrapedData = [];
            let unknownLabels = [];

            // Pass 1: Scrape everything and check for Instant Matches
            inputs.forEach(input => {
                let label = getLabelForInput(input);
                if (!label) return;

                // If we already learned this label, fill it instantly
                if (mappings[label] && vault[mappings[label]]) {
                    input.value = vault[mappings[label]];
                    input.dispatchEvent(new Event("input", { bubbles: true })); // Tell React/Angular it changed
                    input.style.backgroundColor = "#e8f0fe"; // Highlight filled boxes
                } else {
                    // Otherwise, queue it up for the AI vector math
                    scrapedData.push({ element: input, label: label });
                    unknownLabels.push(label);
                }
            });

            // Pass 2: Send the unknown labels to the background AI Worker
            if (unknownLabels.length > 0) {
                chrome.runtime.sendMessage({
                    action: "match_labels",
                    scrapedLabels: unknownLabels,
                    vaultKeys: vaultKeys
                }, (response) => {
                    if (chrome.runtime.lastError || !response || response.status !== "success") return;

                    let aiMatches = response.matches;

                    scrapedData.forEach(data => {
                        let matchedKey = aiMatches[data.label];
                        if (matchedKey && vault[matchedKey]) {
                            data.element.value = vault[matchedKey];
                            data.element.dispatchEvent(new Event("input", { bubbles: true }));
                            data.element.style.backgroundColor = "#e8f0fe";
                            
                            // Learn this AI-discovered rule so we don't need math next time
                            mappings[data.label] = matchedKey;
                        }
                    });

                    // Save the newly learned AI rules
                    chrome.storage.local.set({ learnedMappings: mappings });
                });
            }
        });
        
        sendResponse({ status: "started" });
    }
});