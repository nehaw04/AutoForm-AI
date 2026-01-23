// extension/content.js

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "autofill") {
        const data = request.data;
        let filledCount = 0;

        // Loop through all inputs on the page
        const inputs = document.querySelectorAll('input, textarea, select');

        inputs.forEach(input => {
            // Get attributes to guess what this field is
            const type = (input.type || '').toLowerCase();
            const name = (input.name || '').toLowerCase();
            const id = (input.id || '').toLowerCase();
            const placeholder = (input.placeholder || '').toLowerCase();
            
            // Combine them for easier searching
            const attributes = `${name} ${id} ${placeholder}`;

            // --- MATCHING LOGIC ---

            // 1. NAME
            if (data["Name"] && (attributes.includes("name") || attributes.includes("user") || attributes.includes("full"))) {
                fillField(input, data["Name"]);
                filledCount++;
            }

            // 2. PHONE / MOBILE
            else if (data["Phone"] && (attributes.includes("phone") || attributes.includes("mobile") || attributes.includes("contact") || type === "tel")) {
                fillField(input, data["Phone"]);
                filledCount++;
            }

            // 3. EMAIL
            else if (data["Email"] && (attributes.includes("email") || type === "email")) {
                fillField(input, data["Email"]);
                filledCount++;
            }

            // 4. ID / AADHAAR / NUMBER
            else if (data["ID"] && (attributes.includes("id") || attributes.includes("number") || attributes.includes("aadhaar") || attributes.includes("pan"))) {
                fillField(input, data["ID"]);
                filledCount++;
            }

             // 5. GENDER
             else if (data["Gender"] && (attributes.includes("gender") || attributes.includes("sex"))) {
                 fillField(input, data["Gender"]);
                 filledCount++;
             }
        });

        sendResponse({ count: filledCount });
    }
});

// Helper to safely fill data (works with React/Angular too)
function fillField(input, value) {
    if (input.value === value) return; // Don't overwrite if same
    
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    input.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Highlight it so user knows it was auto-filled
    input.style.backgroundColor = "#e8f0fe";
    input.style.border = "2px solid #007bff";
}