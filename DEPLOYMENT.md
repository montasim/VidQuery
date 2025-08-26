# YouTube Video Chat Extension - Deployment Guide

## Build and Package

The extension is now ready for use! Here are the different deployment options:

### Option 1: Use Pre-built Extension (Recommended)

The extension has been built and packaged. You have two options:

1. **Use the ZIP file**: `youtube-video-chat-extension.zip`
    - Extract the ZIP file
    - Load the extracted folder in Chrome as described below

2. **Use the extension-dist folder directly**
    - The `extension-dist/` folder contains all the files needed
    - Load this folder directly in Chrome

### Option 2: Development Installation

1. Open Chrome/Chromium browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select either:
    - The extracted ZIP folder, OR
    - The `extension-dist/` folder
6. The extension should appear in your extensions list

### Option 3: Chrome Web Store (Advanced)

To publish to the Chrome Web Store:

1. Create a Chrome Web Store developer account ($5 one-time fee)
2. Use the `youtube-video-chat-extension.zip` file
3. Upload and follow Chrome Web Store guidelines
4. Note: You'll need to provide privacy policy and comply with all store requirements

## Configuration

1. After installation, click the extension icon in your browser toolbar
2. Enter your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
3. Click "Save Configuration"
4. Go to any YouTube video and start chatting!

## Build Scripts Available

- `npm run build:extension` - Builds the extension to `extension-dist/` folder
- `npm run package:extension` - Builds and creates a ZIP package
- `npm run lint:check` - Check code quality
- `npm run lint:fix` - Fix code formatting issues

## Files Structure

```
extension-dist/
├── manifest.json         # Extension configuration
├── content.js           # Injected into YouTube pages
├── background.js        # Handles API calls
├── styles.css          # Chat interface styling
├── popup.html          # Extension settings popup
├── popup.js            # Popup functionality
├── icons/              # Extension icons (16,32,48,128px)
├── README.md           # Full documentation
└── INSTALL.md          # Quick installation guide
```

## Testing

1. Go to any YouTube video page (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ)
2. Look for the red "Chat about this video" button on the right side
3. Click to expand the chat interface
4. Try asking: "What is this video about?"

## Troubleshooting

- **Extension not loading**: Check Chrome console for errors in `chrome://extensions/`
- **Chat button not appearing**: Make sure you're on a YouTube video page, not the homepage
- **API key issues**: Verify your Gemini API key is valid and has quota available
- **No AI responses**: Check browser console for network errors

## Security Notes

- The extension only works on YouTube domains for security
- API keys are stored locally in your browser
- No data is sent anywhere except to Google's Gemini API
- All communication uses HTTPS encryption

---

Your YouTube Video Chat Extension is ready to use! 🎉
