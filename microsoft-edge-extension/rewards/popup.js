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
let searchTimeout = null;
let currentSearchIndex = 0;

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const numSearchesInput = document.getElementById('numSearches');
const intervalInput = document.getElementById('interval');
const searchCountSpan = document.getElementById('searchCount');
const totalSearchesSpan = document.getElementById('totalSearches');
const statusDiv = document.getElementById('status');
const optionsLink = document.getElementById('optionsLink');

// Load settings
async function loadSettings() {
  const data = await chrome.storage.sync.get(['searchTerms', 'numSearches', 'interval']);
  
  if (data.searchTerms && data.searchTerms.length > 0) {
    searchTerms = data.searchTerms;
  }
  
  if (data.numSearches) {
    numSearchesInput.value = data.numSearches;
  }
  
  if (data.interval) {
    intervalInput.value = data.interval;
  }
  
  totalSearchesSpan.textContent = numSearchesInput.value;
}

// Save settings
async function saveSettings() {
  await chrome.storage.sync.set({
    numSearches: parseInt(numSearchesInput.value),
    interval: parseInt(intervalInput.value)
  });
}

// Get random search term
function getRandomSearchTerm() {
  const randomIndex = Math.floor(Math.random() * searchTerms.length);
  const term = searchTerms[randomIndex];
  // Add some randomness to make searches more unique
  const randomSuffix = Math.random() > 0.5 ? ` ${new Date().getFullYear()}` : '';
  return term + randomSuffix;
}

// Perform a single search
async function performSearch() {
  const searchTerm = getRandomSearchTerm();
  const encodedTerm = encodeURIComponent(searchTerm);
  const url = `https://www.bing.com/search?q=${encodedTerm}`;
  
  try {
    await chrome.tabs.create({ url, active: false });
    currentSearchIndex++;
    searchCountSpan.textContent = currentSearchIndex;
    updateStatus(`Searching: "${searchTerm}"`, 'searching');
    
    // Check if we've completed all searches
    const totalSearches = parseInt(numSearchesInput.value);
    if (currentSearchIndex >= totalSearches) {
      stopSearching();
      updateStatus(`Completed ${totalSearches} searches!`, 'success');
    }
  } catch (error) {
    console.error('Error creating tab:', error);
    updateStatus('Error creating search tab', 'error');
  }
}

// Start searching
function startSearching() {
  if (isSearching) return;
  
  isSearching = true;
  currentSearchIndex = 0;
  searchCountSpan.textContent = '0';
  totalSearchesSpan.textContent = numSearchesInput.value;
  
  startBtn.disabled = true;
  stopBtn.disabled = false;
  numSearchesInput.disabled = true;
  intervalInput.disabled = true;
  
  saveSettings();
  updateStatus('Starting searches...', 'searching');
  
  // Perform first search immediately
  performSearch();
  
  // Set up interval for remaining searches
  const intervalMs = parseInt(intervalInput.value) * 1000;
  const totalSearches = parseInt(numSearchesInput.value);
  
  function scheduleNextSearch() {
    if (!isSearching || currentSearchIndex >= totalSearches) return;
    
    searchTimeout = setTimeout(() => {
      performSearch();
      scheduleNextSearch();
    }, intervalMs);
  }
  
  scheduleNextSearch();
}

// Stop searching
function stopSearching() {
  isSearching = false;
  
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  
  startBtn.disabled = false;
  stopBtn.disabled = true;
  numSearchesInput.disabled = false;
  intervalInput.disabled = false;
}

// Update status message
function updateStatus(message, type = '') {
  statusDiv.textContent = message;
  statusDiv.className = 'status' + (type ? ` ${type}` : '');
}

// Event Listeners
startBtn.addEventListener('click', startSearching);
stopBtn.addEventListener('click', () => {
  stopSearching();
  updateStatus('Searches stopped', '');
});

numSearchesInput.addEventListener('change', () => {
  totalSearchesSpan.textContent = numSearchesInput.value;
  saveSettings();
});

intervalInput.addEventListener('change', saveSettings);

optionsLink.addEventListener('click', (e) => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// Initialize
loadSettings();
