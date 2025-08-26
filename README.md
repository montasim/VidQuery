# YouTube Video Chat Assistant

A Chromium browser extension that enables AI-powered conversations about YouTube videos using Google's Gemini API. The extension extracts full video context (title, description, transcript) and allows you to ask questions about any YouTube video you're watching.

## Features

- 🎥 **Video Context Extraction**: Automatically extracts video title, description, channel info, and transcript
- 🤖 **AI-Powered Chat**: Uses Google Gemini AI for intelligent responses about video content
- 📺 **Video History**: Track and quickly navigate between recent videos you've chatted about
- 💬 **Seamless Integration**: Chat interface appears directly on YouTube video pages
- 🔒 **Privacy-First**: Your API key is stored locally in the browser
- 📱 **Responsive Design**: Works on desktop and mobile layouts
- ⚡ **Real-time**: Get instant responses while watching videos

## Setup Instructions

### 1. Get a Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Create a new API key
4. Copy the API key (keep it secure!)

### 2. Install the Extension

#### Option A: Load as Developer Extension (Recommended for Development)

1. Open Chrome/Chromium browser
2. Go to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Load unpacked"
5. Select the `youtube-helper` folder
6. The extension should now appear in your extensions list

### 3. Configure the Extension

1. Click the extension icon in your browser toolbar
2. Enter your Gemini API key in the popup
3. Click "Save Configuration"
4. Wait for the success message confirming the API key is valid

### 4. Start Chatting!

1. Go to any YouTube video (e.g., `https://www.youtube.com/watch?v=...`)
2. Look for the red "Chat about this video" button on the bottom right corner
3. Click the button to expand the chat interface
4. **Type your questions** and press Enter or click Send
5. **View video history** by clicking the 📺 button in the chat header
6. Start conversing about the video content!

## Example Questions You Can Ask

- "What is the main topic of this video?"
- "Can you summarize the key points?"
- "What does the speaker say about [specific topic]?"
- "At what time does the speaker mention [something specific]?"
- "What are the main arguments presented?"
- "Can you explain [concept] that was mentioned in the video?"

## Video History & Interface Features

### 📺 Video History

- **Automatic Tracking**: Extension automatically tracks videos you chat about
- **Quick Access**: Click the 📺 button in chat header to view recent videos
- **Current Video Info**: See current video details at the top of chat
- **Easy Navigation**: Click → button to quickly jump to any previous video
- **Smart Storage**: Keeps last 10 videos, stored locally in your browser

### Usage Tips

- **Video Context**: Each video maintains separate chat context - switching videos updates the AI's knowledge
- **History Persistence**: Video history is saved locally and persists across browser sessions
- **Performance**: History is limited to 10 videos to maintain optimal performance

### 🖱️ Fixed Position Interface

- **Fixed Location**: Chat button stays in the bottom right corner for consistency
- **Responsive Design**: Automatically adjusts position on smaller screens
- **Clean Interface**: Simple, non-intrusive design that doesn't interfere with video watching

## Technical Details

### Architecture

- **Content Script** (`content.js`): Injected into YouTube pages, handles UI and video context extraction
- **Background Script** (`background.js`): Handles Gemini API communication
- **Popup** (`popup.html/js`): Extension configuration interface
- **Styles** (`styles.css`): Chat interface styling

### Video Context Extraction

The extension automatically extracts:

- Video title and description
- Channel information
- Video duration and current playback time
- Transcript (when available)
- Video URL and metadata

### Privacy & Security

- API keys are stored locally using Chrome's storage.sync API
- No data is sent to third-party servers except Google's Gemini API
- All communication is encrypted (HTTPS)
- The extension only works on YouTube domains

## Development

### File Structure

```
youtube-helper/
├── manifest.json         # Extension manifest
├── content.js           # Main content script
├── background.js        # Service worker for API calls
├── styles.css          # Chat interface styles
├── popup.html          # Extension popup interface
├── popup.js            # Popup functionality
├── icons/              # Extension icons (add your own)
└── README.md           # This file
```

### API Usage

The extension uses the Gemini 2.5 Flash model via REST API:

- Endpoint: `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent`
- Model: `gemini-2.5-flash` (latest free model with best price-performance)
- Temperature: 0.7 (configurable)
- Max tokens: 1024 (configurable)

## Troubleshooting

### Chat Button Not Appearing

- Make sure you're on a YouTube video page (not the homepage)
- Try refreshing the page
- Check that the extension is enabled in `chrome://extensions/`

### API Key Issues

- Verify your API key is correct and active
- Check that you have available quota in Google AI Studio
- Make sure the API key has the necessary permissions

### No Responses from AI

- Check the browser console for error messages
- Verify your internet connection
- Try regenerating your API key

### Extension Not Loading

- Make sure you've loaded the unpacked extension correctly
- Check for any errors in the Extensions page
- Try reloading the extension

### Video History Issues

- **History Not Showing**: Check if you've visited multiple videos - history appears after 2+ videos
- **Missing Videos**: Only videos you've opened the chat interface on are tracked
- **History Cleared**: History is stored locally - clearing browser data will reset it
- **Navigation Issues**: Ensure popup blockers aren't preventing video navigation

---

## License

[![by-nc-nd/4.0](https://licensebuttons.net/l/by-nc-nd/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc-nd/4.0/)

This project is licensed under the **Creative Commons Attribution-NonCommercial-NoDerivatives 4.0 International (CC BY-NC-ND 4.0)**.

### You are free to:

- **Share** — Copy and redistribute the material in any medium or format.

### Under the following terms:

- **Attribution** — You must give appropriate credit, provide a link to the license, and indicate if changes were made.
- **NonCommercial** — You may not use the material for commercial purposes.
- **NoDerivatives** — If you remix, transform, or build upon the material, you may not distribute the modified material.

For more details, please visit the [Creative Commons License Page](https://creativecommons.org/licenses/by-nc-nd/4.0/).

---

## Acknowledgments

Special thanks to the following resources:

1. **Acknowledgment 1** - Short details of acknowledgments 1.
2. **Acknowledgment 1** - Short details of acknowledgments 2.
3. **Acknowledgment 1** - Short details of acknowledgments 3.

---

## FAQs

### 1. **FAQ1?**

Answer of FAQ1.

### 2. **FAQ2?**

Answer of FAQ2.

### 3. **How do I uninstall the package?**

You can remove the package by running:

```bash
npm uninstall npm-package-name
```

or

```bash
yarn remove npm-package-name
```

or

```bash
pnpm remove npm-package-name
```

or

```bash
bun remove npm-package-name
```

---

## Author

<table>
  <tr>
    <td align="center">
      <img src="https://avatars.githubusercontent.com/u/95298623?v=4" width="100px" alt="Moon">
      <a href="https://github.com/montasim">
        <br>
          Ｍ♢ＮＴΛＳＩＭ
        <br>
      </a>
    </td>
  </tr>
</table>
