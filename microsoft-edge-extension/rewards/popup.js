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
let intervalMin = 5;
let intervalMax = 10;
let requiredTerms = [];
let enableVocabulary = false;
let vocabSearchFormat = 'define';
let vocabularyList = [];
let searchQueue = [];

// DOM Elements
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const numSearchesInput = document.getElementById('numSearches');
const intervalInput = document.getElementById('interval');
const searchCountSpan = document.getElementById('searchCount');
const totalSearchesSpan = document.getElementById('totalSearches');
const statusDiv = document.getElementById('status');
const optionsLink = document.getElementById('optionsLink');
const intervalMinDisplay = document.getElementById('intervalMinDisplay');
const intervalMaxDisplay = document.getElementById('intervalMaxDisplay');

// Load settings
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

// Get random search term
function getRandomSearchTerm() {
  const randomIndex = Math.floor(Math.random() * searchTerms.length);
  const term = searchTerms[randomIndex];
  // Add some randomness to make searches more unique
  const randomSuffix = Math.random() > 0.5 ? ` ${new Date().getFullYear()}` : '';
  return term + randomSuffix;
}

// Get random interval in milliseconds
function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min) * 1000;
}

// Shuffle array in place
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Format vocabulary search
function formatVocabSearch(word) {
  switch (vocabSearchFormat) {
    case 'define': return `define ${word}`;
    case 'meaning': return `${word} meaning`;
    case 'definition': return `${word} definition`;
    case 'whatis': return `what is ${word}`;
    default: return `define ${word}`;
  }
}

// Build search queue with priority
function buildSearchQueue(totalSearches) {
  const queue = [];
  
  // 1. Add required terms first (up to totalSearches)
  const requiredCount = Math.min(requiredTerms.length, totalSearches);
  for (let i = 0; i < requiredCount; i++) {
    queue.push(requiredTerms[i]);
  }
  
  // 2. Calculate remaining slots
  const remaining = totalSearches - queue.length;
  
  if (remaining > 0) {
    // 3. Build pool of random terms (including vocabulary if enabled)
    let randomPool = [...searchTerms];
    
    if (enableVocabulary && vocabularyList.length > 0) {
      const vocabSearches = vocabularyList.map(word => formatVocabSearch(word));
      randomPool = [...randomPool, ...vocabSearches];
    }
    
    // 4. Shuffle and pick random terms to fill remaining slots
    shuffleArray(randomPool);
    for (let i = 0; i < remaining; i++) {
      queue.push(randomPool[i % randomPool.length]);
    }
  }
  
  return queue;
}

// Perform a single search
async function performSearch() {
  const searchTerm = searchQueue[currentSearchIndex] || getRandomSearchTerm(); // Fallback to random
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
  
  // Build search queue with priority
  const totalSearches = parseInt(numSearchesInput.value);
  searchQueue = buildSearchQueue(totalSearches);
  
  startBtn.disabled = true;
  stopBtn.disabled = false;
  numSearchesInput.disabled = true;
  intervalInput.disabled = true;
  
  saveSettings();
  updateStatus('Starting searches...', 'searching');
  
  // Perform first search immediately
  performSearch();
  
  // Schedule remaining searches
  scheduleNextSearch();
}

// Schedule next search
function scheduleNextSearch() {
  if (!isSearching || currentSearchIndex >= parseInt(numSearchesInput.value)) return;
  
  const intervalMs = getRandomInterval(intervalMin, intervalMax);
  searchTimeout = setTimeout(() => {
    performSearch();
    scheduleNextSearch();
  }, intervalMs);
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
