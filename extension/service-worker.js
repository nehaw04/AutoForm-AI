// --- FAST ALGORITHMIC MATCHER (No AI Downloads Required) ---

// Calculates how many edits it takes to turn string A into string B
function getSimilarity(s1, s2) {
    let longer = s1, shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    let longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    let costs = new Array();
    for (let i = 0; i <= longer.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= shorter.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (longer.charAt(i - 1) != shorter.charAt(j - 1))
                        newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[shorter.length] = lastValue;
    }
    return (longerLength - costs[shorter.length]) / parseFloat(longerLength);
}

// Clean text for better matching (removes punctuation, spaces, makes lowercase)
function normalizeText(text) {
    return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

// Listen for requests from content.js
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "match_labels") {
        
        const { scrapedLabels, vaultKeys } = request;
        let matches = {};

        // Compare each scraped webpage label against your Vault keys
        for (let label of scrapedLabels) {
            let cleanLabel = normalizeText(label);
            let bestMatch = null;
            let highestScore = 0;

            for (let vaultKey of vaultKeys) {
                let cleanKey = normalizeText(vaultKey);
                
                // 1. Direct Substring Check (e.g., "first name" is inside "applicant first name")
                if (cleanLabel.includes(cleanKey) || cleanKey.includes(cleanLabel)) {
                    highestScore = 1.0;
                    bestMatch = vaultKey;
                    break; 
                }

                // 2. Fuzzy Math Check
                let score = getSimilarity(cleanLabel, cleanKey);
                if (score > highestScore) {
                    highestScore = score;
                    bestMatch = vaultKey;
                }
            }

            // Accept match if confidence is above 50%
            if (highestScore >= 0.50) {
                matches[label] = bestMatch;
            }
        }

        // Send the matches instantly
        sendResponse({ status: "success", matches: matches });
        return true; 
    }
});