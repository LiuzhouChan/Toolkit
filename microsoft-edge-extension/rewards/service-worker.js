// Background service worker for Bing Rewards Search Helper

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Set default settings on first install
    chrome.storage.sync.set({
      numSearches: 30,
      interval: 3,
      searchTerms: []
    });
    
    console.log('Bing Rewards Search Helper installed');
  }
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getSettings') {
    chrome.storage.sync.get(['searchTerms', 'numSearches', 'interval'], (data) => {
      sendResponse(data);
    });
    return true; // Keep message channel open for async response
  }
});
