# Bing Rewards Search Helper

A Microsoft Edge extension that helps you complete your daily Microsoft Rewards search tasks by automatically opening Bing searches in new tabs.

## Features

- Automatically opens Bing searches in new tabs
- Customizable number of searches (default: 30 for daily PC searches)
- Adjustable search interval to avoid triggering anti-bot measures
- Custom search terms support
- Pre-built search term categories (Tech, Entertainment, Sports, etc.)
- Clean, modern UI following Microsoft Fluent Design principles
- Settings sync across devices

## Installation

### Method 1: Load Unpacked Extension (Development Mode)

1. **Download/Clone the extension folder**
   ```bash
   git clone https://github.com/yourusername/Toolkit.git
   cd Toolkit/microsoft-edge-extension/rewards
   ```

2. **Open Edge Extensions page**
   - Open Microsoft Edge
   - Navigate to `edge://extensions/`
   - Or go to Menu (⋯) → Extensions → Manage extensions

3. **Enable Developer Mode**
   - Toggle "Developer mode" switch in the bottom-left corner

4. **Load the extension**
   - Click "Load unpacked"
   - Select the `rewards` folder (containing `manifest.json`)
   - The extension icon should appear in the toolbar

5. **Pin the extension (recommended)**
   - Click the puzzle piece icon (Extensions)
   - Click the pin icon next to "Bing Rewards Search Helper"

### Method 2: AI Agent Installation (Automated)

If you're using an AI agent (like OpenCode), use this prompt:

```
Install the Bing Rewards Search Helper extension from microsoft-edge-extension/rewards folder by:
1. Instructing me how to open edge://extensions
2. Enable developer mode
3. Load the unpacked extension from the rewards folder
```

## Usage

### Basic Usage

1. Click the extension icon in the Edge toolbar
2. Set the number of searches (default: 30 for daily PC rewards)
3. Set the interval between searches (default: 3 seconds)
4. Click "Start Searches"
5. The extension will open new tabs with Bing searches

### Custom Search Terms

1. Click "Settings" in the extension popup
2. Enter your custom search terms (one per line)
3. Use "Quick Add" buttons to add category-specific terms
4. Click "Save Settings"

### Tips for Microsoft Rewards

- **Daily PC Searches**: Complete 30 searches on PC Edge for maximum points
- **Daily Mobile Searches**: Complete 20 searches on mobile Edge
- **Recommended Interval**: 3-5 seconds between searches
- **Vary Search Terms**: Use diverse topics to appear more natural

## Configuration

| Setting | Default | Description |
|---------|---------|-------------|
| Number of Searches | 30 | How many searches to perform |
| Interval | 3 seconds | Time between each search |
| Search Terms | Built-in list | Custom terms for searches |

## Files Structure

```
rewards/
├── manifest.json       # Extension configuration
├── popup.html          # Main popup UI
├── popup.css           # Popup styles
├── popup.js            # Popup logic
├── options.html        # Settings page
├── options.css         # Settings styles
├── options.js          # Settings logic
├── service-worker.js   # Background service
├── icons/              # Extension icons
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
└── README.md           # This file
```

## Troubleshooting

### Extension not loading
- Ensure all files are in the correct folder
- Check for JSON syntax errors in manifest.json
- Verify Developer mode is enabled

### Searches not working
- Check if you're signed into your Microsoft account
- Ensure tabs permission is granted
- Try increasing the interval between searches

### Settings not saving
- Check browser storage permissions
- Try clearing extension storage and reloading

## Disclaimer

This extension is provided for convenience and educational purposes. Use responsibly and in accordance with Microsoft Rewards Terms of Service. Automated searches may violate terms of service - use at your own risk.

## License

MIT License - See repository LICENSE file for details.

## Contributing

Contributions welcome! Please submit pull requests or issues to the main repository.
