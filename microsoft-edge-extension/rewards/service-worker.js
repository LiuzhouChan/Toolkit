// Background service worker for Bing Rewards Search Helper

// Default search terms
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

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    chrome.storage.sync.set({
      numSearches: 30,
      intervalMin: 5,
      intervalMax: 10,
      searchTerms: [],
      requiredTerms: [],
      enableVocabulary: false,
      vocabSearchFormat: 'define',
      vocabularyList: []
    });
    console.log('Bing Rewards Search Helper installed');
  }
});

// Alarm listener for scheduled searches
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'bingSearch') {
    await performSearch();
  }
});

// Message listener
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startSearch') {
    startSearching(request.settings).then(sendResponse);
    return true;
  }
  
  if (request.action === 'stopSearch') {
    stopSearching().then(sendResponse);
    return true;
  }
  
  if (request.action === 'getStatus') {
    getSearchStatus().then(sendResponse);
    return true;
  }
});

// Helper functions
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function formatVocabSearch(word, format) {
  switch (format) {
    case 'define': return `define ${word}`;
    case 'meaning': return `${word} meaning`;
    case 'definition': return `${word} definition`;
    case 'whatis': return `what is ${word}`;
    default: return `define ${word}`;
  }
}

function buildSearchQueue(settings) {
  const queue = [];
  const { totalSearches, requiredTerms = [], searchTerms, enableVocabulary, vocabSearchFormat, vocabularyList = [] } = settings;
  
  // Use custom terms or defaults
  const baseTerms = searchTerms && searchTerms.length > 0 ? searchTerms : DEFAULT_SEARCH_TERMS;
  
  // 1. Add required terms first
  const requiredCount = Math.min(requiredTerms.length, totalSearches);
  for (let i = 0; i < requiredCount; i++) {
    queue.push(requiredTerms[i]);
  }
  
  // 2. Fill remaining with random/vocab mix
  const remaining = totalSearches - queue.length;
  if (remaining > 0) {
    let randomPool = [...baseTerms];
    
    if (enableVocabulary && vocabularyList.length > 0) {
      const vocabSearches = vocabularyList.map(word => formatVocabSearch(word, vocabSearchFormat));
      randomPool = [...randomPool, ...vocabSearches];
    }
    
    const shuffled = shuffleArray(randomPool);
    for (let i = 0; i < remaining; i++) {
      queue.push(shuffled[i % shuffled.length]);
    }
  }
  
  return queue;
}

function getRandomInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

async function startSearching(settings) {
  const { numSearches, intervalMin, intervalMax, searchTerms, requiredTerms, enableVocabulary, vocabSearchFormat, vocabularyList } = settings;
  
  const searchQueue = buildSearchQueue({
    totalSearches: numSearches,
    requiredTerms,
    searchTerms,
    enableVocabulary,
    vocabSearchFormat,
    vocabularyList
  });
  
  // Save search state
  await chrome.storage.local.set({
    isSearching: true,
    currentSearchIndex: 0,
    totalSearches: numSearches,
    searchQueue: searchQueue,
    intervalMin: intervalMin,
    intervalMax: intervalMax,
    lastSearchTerm: ''
  });
  
  // Perform first search immediately
  await performSearch();
  
  return { success: true };
}

async function performSearch() {
  const state = await chrome.storage.local.get([
    'isSearching', 'currentSearchIndex', 'totalSearches', 'searchQueue', 'intervalMin', 'intervalMax'
  ]);
  
  if (!state.isSearching || state.currentSearchIndex >= state.totalSearches) {
    await stopSearching();
    return;
  }
  
  const searchTerm = state.searchQueue[state.currentSearchIndex];
  const encodedTerm = encodeURIComponent(searchTerm);
  const url = `https://www.bing.com/search?q=${encodedTerm}`;
  
  try {
    await chrome.tabs.create({ url, active: false });
    
    const newIndex = state.currentSearchIndex + 1;
    await chrome.storage.local.set({
      currentSearchIndex: newIndex,
      lastSearchTerm: searchTerm
    });
    
    // Check if complete
    if (newIndex >= state.totalSearches) {
      await stopSearching();
    } else {
      // Schedule next search with random interval (convert seconds to minutes for chrome.alarms)
      const delaySec = getRandomInterval(state.intervalMin, state.intervalMax);
      chrome.alarms.create('bingSearch', { delayInMinutes: delaySec / 60 });
    }
  } catch (error) {
    console.error('Error creating tab:', error);
    // Try to continue with next search
    const delaySec = getRandomInterval(state.intervalMin || 5, state.intervalMax || 10);
    chrome.alarms.create('bingSearch', { delayInMinutes: delaySec / 60 });
  }
}

async function stopSearching() {
  await chrome.alarms.clear('bingSearch');
  const state = await chrome.storage.local.get(['currentSearchIndex', 'totalSearches']);
  await chrome.storage.local.set({ 
    isSearching: false,
    completedSearches: state.currentSearchIndex || 0
  });
  return { success: true };
}

async function getSearchStatus() {
  const state = await chrome.storage.local.get([
    'isSearching', 'currentSearchIndex', 'totalSearches', 'lastSearchTerm'
  ]);
  return {
    isSearching: state.isSearching || false,
    currentSearchIndex: state.currentSearchIndex || 0,
    totalSearches: state.totalSearches || 0,
    lastSearchTerm: state.lastSearchTerm || ''
  };
}
