// Default search terms categories
const SEARCH_CATEGORIES = {
  tech: [
    'latest tech news', 'smartphone reviews', 'laptop comparison',
    'AI developments', 'programming tutorials', 'software updates',
    'cybersecurity tips', 'gadget reviews', 'tech startups',
    'cloud computing', 'web development', 'mobile apps'
  ],
  entertainment: [
    'new movie releases', 'tv series recommendations', 'music albums',
    'celebrity news', 'video game reviews', 'streaming shows',
    'podcast recommendations', 'comedy specials', 'animated movies',
    'documentary films', 'concert tickets', 'theater shows'
  ],
  sports: [
    'football scores', 'basketball highlights', 'tennis results',
    'soccer news', 'baseball standings', 'hockey updates',
    'golf tournaments', 'olympics news', 'formula 1 racing',
    'mma fights', 'boxing matches', 'cricket scores'
  ],
  food: [
    'easy dinner recipes', 'healthy breakfast ideas', 'baking tips',
    'vegetarian meals', 'grilling techniques', 'dessert recipes',
    'meal prep ideas', 'cooking tutorials', 'restaurant reviews',
    'food delivery', 'kitchen gadgets', 'wine pairing'
  ],
  travel: [
    'best travel destinations', 'flight deals', 'hotel reviews',
    'beach vacations', 'city breaks', 'adventure travel',
    'travel tips', 'packing guides', 'local attractions',
    'road trip ideas', 'cruise vacations', 'budget travel'
  ],
  health: [
    'workout routines', 'yoga exercises', 'meditation techniques',
    'healthy eating', 'weight loss tips', 'running training',
    'gym equipment', 'mental health', 'sleep improvement',
    'nutrition advice', 'fitness apps', 'wellness trends'
  ]
};

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

// DOM Elements
const defaultNumSearchesInput = document.getElementById('defaultNumSearches');
const defaultIntervalInput = document.getElementById('defaultInterval');
const searchTermsTextarea = document.getElementById('searchTerms');
const termCountSpan = document.getElementById('termCount');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const saveStatus = document.getElementById('saveStatus');
const requiredTermsTextarea = document.getElementById('requiredTerms');
const requiredTermCountSpan = document.getElementById('requiredTermCount');
const enableVocabularyCheckbox = document.getElementById('enableVocabulary');
const vocabSearchFormatSelect = document.getElementById('vocabSearchFormat');
const vocabularyListTextarea = document.getElementById('vocabularyList');
const vocabCountSpan = document.getElementById('vocabCount');
const intervalMinInput = document.getElementById('intervalMin');
const intervalMaxInput = document.getElementById('intervalMax');

// Load settings
async function loadSettings() {
  const data = await chrome.storage.sync.get([
    'searchTerms', 'numSearches', 'interval', 'defaultInterval',
    'intervalMin', 'intervalMax', 'requiredTerms', 'enableVocabulary',
    'vocabSearchFormat', 'vocabularyList'
  ]);
  
  if (data.numSearches) {
    defaultNumSearchesInput.value = data.numSearches;
  }
  
  if (data.interval) {
    defaultIntervalInput.value = data.interval;
  }
  
  // Migrate old interval to new intervalMin/intervalMax
  if (data.intervalMin !== undefined && data.intervalMax !== undefined) {
    intervalMinInput.value = data.intervalMin;
    intervalMaxInput.value = data.intervalMax;
  } else if (data.interval || data.defaultInterval) {
    const oldInterval = data.interval || data.defaultInterval || 3;
    intervalMinInput.value = oldInterval;
    intervalMaxInput.value = oldInterval + 2;
  }
  
  // Load required terms
  if (data.requiredTerms && data.requiredTerms.length > 0) {
    requiredTermsTextarea.value = data.requiredTerms.join('\n');
  }
  
  // Load vocabulary settings
  if (data.enableVocabulary !== undefined) {
    enableVocabularyCheckbox.checked = data.enableVocabulary;
  }
  
  if (data.vocabSearchFormat) {
    vocabSearchFormatSelect.value = data.vocabSearchFormat;
  }
  
  if (data.vocabularyList && data.vocabularyList.length > 0) {
    vocabularyListTextarea.value = data.vocabularyList.join('\n');
  }
  
  if (data.searchTerms && data.searchTerms.length > 0) {
    searchTermsTextarea.value = data.searchTerms.join('\n');
  }
  
  // Update counters
  updateTermCount();
  updateRequiredTermCount();
  updateVocabCount();
}

// Save settings
async function saveSettings() {
  const searchTermsText = searchTermsTextarea.value.trim();
  const searchTerms = searchTermsText
    ? searchTermsText.split('\n').map(t => t.trim()).filter(t => t.length > 0)
    : [];
  
  const requiredTermsText = requiredTermsTextarea.value.trim();
  const requiredTerms = requiredTermsText
    ? requiredTermsText.split('\n').map(t => t.trim()).filter(t => t.length > 0)
    : [];
  
  const vocabularyListText = vocabularyListTextarea.value.trim();
  const vocabularyList = vocabularyListText
    ? vocabularyListText.split('\n').map(t => t.trim()).filter(t => t.length > 0)
    : [];
  
  try {
    await chrome.storage.sync.set({
      numSearches: parseInt(defaultNumSearchesInput.value),
      interval: parseInt(defaultIntervalInput.value),
      intervalMin: parseInt(intervalMinInput.value),
      intervalMax: parseInt(intervalMaxInput.value),
      searchTerms: searchTerms,
      requiredTerms: requiredTerms,
      enableVocabulary: enableVocabularyCheckbox.checked,
      vocabSearchFormat: vocabSearchFormatSelect.value,
      vocabularyList: vocabularyList
    });
    
    showSaveStatus('Settings saved successfully!', 'success');
  } catch (error) {
    console.error('Error saving settings:', error);
    showSaveStatus('Error saving settings', 'error');
  }
}

// Reset to defaults
async function resetToDefaults() {
  if (!confirm('Are you sure you want to reset all settings to defaults?')) {
    return;
  }
  
  defaultNumSearchesInput.value = 30;
  defaultIntervalInput.value = 3;
  intervalMinInput.value = 5;
  intervalMaxInput.value = 10;
  searchTermsTextarea.value = DEFAULT_SEARCH_TERMS.join('\n');
  requiredTermsTextarea.value = '';
  enableVocabularyCheckbox.checked = false;
  vocabSearchFormatSelect.value = 'define';
  vocabularyListTextarea.value = '';
  
  await saveSettings();
  updateTermCount();
  updateRequiredTermCount();
  updateVocabCount();
}

// Add category terms
function addCategoryTerms(category) {
  const terms = SEARCH_CATEGORIES[category];
  if (!terms) return;
  
  const currentText = searchTermsTextarea.value.trim();
  const currentTerms = currentText ? currentText.split('\n') : [];
  const newTerms = [...new Set([...currentTerms, ...terms])];
  
  searchTermsTextarea.value = newTerms.join('\n');
  updateTermCount();
}

// Update term count
function updateTermCount() {
  const text = searchTermsTextarea.value.trim();
  const count = text ? text.split('\n').filter(t => t.trim().length > 0).length : 0;
  termCountSpan.textContent = count;
}

// Update required term count
function updateRequiredTermCount() {
  const text = requiredTermsTextarea.value.trim();
  const count = text ? text.split('\n').filter(t => t.trim().length > 0).length : 0;
  requiredTermCountSpan.textContent = count;
}

// Update vocabulary count
function updateVocabCount() {
  const text = vocabularyListTextarea.value.trim();
  const count = text ? text.split('\n').filter(t => t.trim().length > 0).length : 0;
  vocabCountSpan.textContent = count;
}

// Show save status
function showSaveStatus(message, type) {
  saveStatus.textContent = message;
  saveStatus.className = 'save-status ' + type;
  
  setTimeout(() => {
    saveStatus.textContent = '';
    saveStatus.className = 'save-status';
  }, 3000);
}

// Event Listeners
saveBtn.addEventListener('click', saveSettings);
resetBtn.addEventListener('click', resetToDefaults);
searchTermsTextarea.addEventListener('input', updateTermCount);
requiredTermsTextarea.addEventListener('input', updateRequiredTermCount);
vocabularyListTextarea.addEventListener('input', updateVocabCount);
enableVocabularyCheckbox.addEventListener('change', saveSettings);
vocabSearchFormatSelect.addEventListener('change', saveSettings);
intervalMinInput.addEventListener('change', saveSettings);
intervalMaxInput.addEventListener('change', saveSettings);

// Quick add buttons
document.querySelectorAll('[data-category]').forEach(btn => {
  btn.addEventListener('click', () => {
    addCategoryTerms(btn.dataset.category);
  });
});

// Initialize
loadSettings();
