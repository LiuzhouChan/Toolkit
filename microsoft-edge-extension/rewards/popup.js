// Default search terms - diverse topics to appear more natural
const DEFAULT_SEARCH_TERMS = [
  'weather today', 'latest news', 'recipe ideas', 'movie reviews',
  'best restaurants nearby', 'travel destinations', 'technology news',
  'sports scores', 'music playlist', 'book recommendations',
  'fitness tips', 'healthy recipes', 'gaming news', 'science discoveries',
  'art exhibitions', 'fashion trends', 'home decor ideas', 'car reviews',
  'investment tips', 'career advice', 'learning programming', 'history facts',
  'space exploration', 'wildlife documentaries', 'cooking techniques',
  'photography tips', 'gardening advice', 'pet care', 'diy projects',
  'streaming shows', 'podcast recommendations', 'meditation techniques',
  'yoga exercises', 'running tips', 'cycling routes', 'hiking trails',
  'camping gear', 'fishing spots', 'skiing resorts', 'beach vacations',
  'city breaks', 'cultural events', 'local attractions', 'museum exhibits',
  'concert tickets', 'theater shows', 'comedy specials', 'documentary films',
  'animated movies', 'classic films'
];

let searchTerms = [...DEFAULT_SEARCH_TERMS];
let isSearching = false;
let intervalMin = 5;
let intervalMax = 10;
let requiredTerms = [];
let enableVocabulary = false;
let vocabSearchFormat = 'define';
let vocabularyList = [];
let statusPollInterval = null;

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const numSearchesInput = document.getElementById('numSearches');
const searchCountSpan = document.getElementById('searchCount');
const totalSearchesSpan = document.getElementById('totalSearches');
const statusDiv = document.getElementById('status');
const optionsLink = document.getElementById('optionsLink');
const intervalMinDisplay = document.getElementById('intervalMinDisplay');
const intervalMaxDisplay = document.getElementById('intervalMaxDisplay');

// Load settings from storage
async function loadSettings() {
  const data = await chrome.storage.sync.get([
    'searchTerms', 'numSearches', 'intervalMin', 'intervalMax',
    'requiredTerms', 'enableVocabulary', 'vocabSearchFormat', 'vocabularyList'
  ]);
  
  if (data.searchTerms && data.searchTerms.length > 0) {
    searchTerms = data.searchTerms;
  }
  
  if (data.numSearches) {
    numSearchesInput.value = data.numSearches;
  }
  
  // Load interval range
  if (data.intervalMin !== undefined) {
    intervalMin = data.intervalMin;
    intervalMinDisplay.textContent = intervalMin;
  }
  
  if (data.intervalMax !== undefined) {
    intervalMax = data.intervalMax;
    intervalMaxDisplay.textContent = intervalMax;
  }
  
  // Load required terms
  if (data.requiredTerms && data.requiredTerms.length > 0) {
    requiredTerms = data.requiredTerms;
  }
  
  // Load vocabulary settings
  if (data.enableVocabulary !== undefined) {
    enableVocabulary = data.enableVocabulary;
  }
  
  if (data.vocabSearchFormat) {
    vocabSearchFormat = data.vocabSearchFormat;
  }
  
  if (data.vocabularyList && data.vocabularyList.length > 0) {
    vocabularyList = data.vocabularyList;
  }
  
  totalSearchesSpan.textContent = numSearchesInput.value;
}

// Save settings
async function saveSettings() {
  await chrome.storage.sync.set({
    numSearches: parseInt(numSearchesInput.value)
  });
}

// Update status message
function updateStatus(message, type = '') {
  statusDiv.textContent = message;
  statusDiv.className = 'status' + (type ? ` ${type}` : '');
}

// Start searching - send message to service worker
async function startSearching() {
  if (isSearching) return;
  
  const totalSearches = parseInt(numSearchesInput.value);
  
  // Send start message to service worker
  const response = await chrome.runtime.sendMessage({
    action: 'startSearch',
    settings: {
      numSearches: totalSearches,
      intervalMin,
      intervalMax,
      searchTerms,
      requiredTerms,
      enableVocabulary,
      vocabSearchFormat,
      vocabularyList
    }
  });
  
  if (response && response.success) {
    isSearching = true;
    searchCountSpan.textContent = '0';
    totalSearchesSpan.textContent = totalSearches;
    
    startBtn.disabled = true;
    stopBtn.disabled = false;
    numSearchesInput.disabled = true;
    
    updateStatus('Searches running in background...', 'searching');
    saveSettings();
    
    // Start polling for updates
    startStatusPolling();
  }
}

// Stop searching
async function stopSearching() {
  await chrome.runtime.sendMessage({ action: 'stopSearch' });
  
  isSearching = false;
  stopStatusPolling();
  
  startBtn.disabled = false;
  stopBtn.disabled = true;
  numSearchesInput.disabled = false;
  
  updateStatus('Searches stopped', '');
}

// Poll for status updates
function startStatusPolling() {
  stopStatusPolling(); // Clear any existing interval
  
  statusPollInterval = setInterval(async () => {
    try {
      const status = await chrome.runtime.sendMessage({ action: 'getStatus' });
      
      if (status) {
        searchCountSpan.textContent = status.currentSearchIndex;
        
        if (status.lastSearchTerm) {
          updateStatus(`Searching: "${status.lastSearchTerm}"`, 'searching');
        }
        
        if (!status.isSearching) {
          isSearching = false;
          stopStatusPolling();
          startBtn.disabled = false;
          stopBtn.disabled = true;
          numSearchesInput.disabled = false;
          
          if (status.currentSearchIndex >= status.totalSearches && status.totalSearches > 0) {
            updateStatus(`Completed ${status.totalSearches} searches!`, 'success');
          }
        }
      }
    } catch (error) {
      console.error('Error polling status:', error);
    }
  }, 1000);
}

function stopStatusPolling() {
  if (statusPollInterval) {
    clearInterval(statusPollInterval);
    statusPollInterval = null;
  }
}

// Check current status when popup opens
async function checkCurrentStatus() {
  try {
    const status = await chrome.runtime.sendMessage({ action: 'getStatus' });
    
    if (status && status.isSearching) {
      isSearching = true;
      searchCountSpan.textContent = status.currentSearchIndex;
      totalSearchesSpan.textContent = status.totalSearches;
      
      startBtn.disabled = true;
      stopBtn.disabled = false;
      numSearchesInput.disabled = true;
      
      if (status.lastSearchTerm) {
        updateStatus(`Searching: "${status.lastSearchTerm}"`, 'searching');
      } else {
        updateStatus('Searches running in background...', 'searching');
      }
      
      startStatusPolling();
    }
  } catch (error) {
    console.error('Error checking status:', error);
  }
}

// Event Listeners
startBtn.addEventListener('click', startSearching);
stopBtn.addEventListener('click', stopSearching);

numSearchesInput.addEventListener('change', () => {
  totalSearchesSpan.textContent = numSearchesInput.value;
  saveSettings();
});

optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Initialize
loadSettings().then(() => checkCurrentStatus());
