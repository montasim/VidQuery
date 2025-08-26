class YouTubeVideoChat {
    constructor() {
        this.chatContainer = null;
        this.isExpanded = false;
        this.videoData = null;
        this.videoHistory = [];
        this.currentVideoId = null;
        this.messageCounter = 0;
        this.contextExtractionPromise = null;
        this.contextExtractionRetries = 0;
        this.maxContextRetries = 3;
        this.navigationDebounceTimer = null;
        this.init();
    }

    init() {
        this.loadVideoHistory();
        this.waitForVideo();
        this.setupNavigationListener();
    }

    loadVideoHistory() {
        try {
            const saved = localStorage.getItem('youtube-chat-video-history');
            if (saved) {
                this.videoHistory = JSON.parse(saved);
                // Keep only last 10 videos
                if (this.videoHistory.length > 10) {
                    this.videoHistory = this.videoHistory.slice(-10);
                    this.saveVideoHistory();
                }
            }
        } catch (error) {
            console.error('Error loading video history:', error);
            this.videoHistory = [];
        }
    }

    saveVideoHistory() {
        try {
            localStorage.setItem(
                'youtube-chat-video-history',
                JSON.stringify(this.videoHistory)
            );
        } catch (error) {
            console.error('Error saving video history:', error);
        }
    }

    waitForVideo() {
        const checkForVideo = () => {
            const video = document.querySelector('video');
            const videoTitle = document.querySelector(
                '#title h1.ytd-watch-metadata yt-formatted-string'
            );

            if (video && videoTitle && !this.chatContainer) {
                this.createChatInterface();
                this.extractVideoContext();
            } else if (video && videoTitle && this.chatContainer) {
                // Chat exists but video changed - extract new context
                const currentUrl = window.location.href;
                if (this.videoData && this.videoData.url !== currentUrl) {
                    this.extractVideoContext();
                }
            } else if (!video || !videoTitle) {
                this.removeChatInterface();
            }
        };

        const observer = new MutationObserver(checkForVideo);
        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        checkForVideo();
    }

    setupNavigationListener() {
        let lastUrl = location.href;
        let lastVideoId = this.extractVideoIdFromUrl(location.href);

        const handleNavigation = (eventType = 'unknown') => {
            const currentUrl = location.href;
            const currentVideoId = this.extractVideoIdFromUrl(currentUrl);

            if (currentUrl !== lastUrl || currentVideoId !== lastVideoId) {
                console.info(`Navigation detected (${eventType}):`, {
                    from: lastUrl,
                    to: currentUrl,
                    fromVideoId: lastVideoId,
                    toVideoId: currentVideoId,
                });

                lastUrl = currentUrl;
                lastVideoId = currentVideoId;

                // Debounce rapid navigation
                this.debounceNavigation(() => {
                    this.handleVideoChange(currentVideoId, currentUrl);
                });
            }
        };

        // Listen for YouTube's internal navigation events (most reliable)
        document.addEventListener('yt-navigate-finish', () =>
            handleNavigation('yt-navigate-finish')
        );
        document.addEventListener('yt-page-data-updated', () =>
            handleNavigation('yt-page-data-updated')
        );

        // Fallback to URL monitoring for older YouTube versions
        window.addEventListener('popstate', () => handleNavigation('popstate'));

        // Monitor history API calls
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;

        history.pushState = function (...args) {
            originalPushState.apply(history, args);
            setTimeout(() => handleNavigation('pushState'), 50);
        };

        history.replaceState = function (...args) {
            originalReplaceState.apply(history, args);
            setTimeout(() => handleNavigation('replaceState'), 50);
        };

        // Additional DOM-based detection for edge cases
        this.setupDOMObserver();
    }

    extractVideoIdFromUrl(url) {
        const urlObj = new URL(url);

        // Handle regular watch URLs
        if (urlObj.pathname === '/watch') {
            return urlObj.searchParams.get('v');
        }

        // Handle Shorts URLs
        if (urlObj.pathname.startsWith('/shorts/')) {
            return urlObj.pathname.split('/shorts/')[1];
        }

        // Handle live URLs
        if (urlObj.pathname.startsWith('/live/')) {
            return urlObj.pathname.split('/live/')[1];
        }

        return null;
    }

    debounceNavigation(callback) {
        // Clear any existing timer
        if (this.navigationDebounceTimer) {
            clearTimeout(this.navigationDebounceTimer);
        }

        // Cancel any pending context extraction
        if (this.contextExtractionPromise) {
            this.contextExtractionPromise.cancelled = true;
        }

        // Set new timer
        this.navigationDebounceTimer = setTimeout(callback, 300);
    }

    setupDOMObserver() {
        // Watch for video element changes
        const videoObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (
                    mutation.type === 'attributes' &&
                    mutation.attributeName === 'src'
                ) {
                    const video = mutation.target;
                    if (video.tagName === 'VIDEO' && video.src) {
                        console.info('Video src changed:', video.src);
                        // Small delay to let other elements update
                        setTimeout(() => {
                            this.handleVideoChange(
                                this.extractVideoIdFromUrl(location.href),
                                location.href,
                                'video-src-change'
                            );
                        }, 100);
                    }
                }
            });
        });

        // Watch for title changes
        const titleObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    const titleElement = document.querySelector(
                        '#title h1.ytd-watch-metadata yt-formatted-string'
                    );
                    if (
                        titleElement &&
                        titleElement.textContent &&
                        this.videoData
                    ) {
                        const newTitle = titleElement.textContent.trim();
                        if (newTitle !== this.videoData.title) {
                            console.info('Video title changed:', newTitle);
                            // Title changed, context may need updating
                            setTimeout(() => {
                                this.handleVideoChange(
                                    this.extractVideoIdFromUrl(location.href),
                                    location.href,
                                    'title-change'
                                );
                            }, 100);
                        }
                    }
                }
            });
        });

        // Start observing
        const videoElement = document.querySelector('video');
        if (videoElement) {
            videoObserver.observe(videoElement, {
                attributes: true,
                attributeFilter: ['src'],
            });
        }

        const titleContainer = document.querySelector('#title');
        if (titleContainer) {
            titleObserver.observe(titleContainer, {
                childList: true,
                subtree: true,
            });
        }

        // Re-observe when page structure changes
        const pageObserver = new MutationObserver(() => {
            const video = document.querySelector('video');
            const titleContainer = document.querySelector('#title');

            if (video && !video.dataset.observed) {
                video.dataset.observed = 'true';
                videoObserver.observe(video, {
                    attributes: true,
                    attributeFilter: ['src'],
                });
            }

            if (titleContainer && !titleContainer.dataset.observed) {
                titleContainer.dataset.observed = 'true';
                titleObserver.observe(titleContainer, {
                    childList: true,
                    subtree: true,
                });
            }
        });

        pageObserver.observe(document.body, { childList: true, subtree: true });
    }

    async handleVideoChange(videoId, url, trigger = 'navigation') {
        console.info(`Handling video change (${trigger}):`, { videoId, url });

        // Reset context extraction state
        this.contextExtractionRetries = 0;
        this.videoData = null;

        // Check if we're on a video page
        if (!videoId || !this.isVideoPage()) {
            this.removeChatInterface();
            return;
        }

        // Create or update chat interface
        if (!this.chatContainer) {
            this.createChatInterface();
        }

        // Extract video context with retry mechanism
        try {
            await this.extractVideoContextWithRetry(videoId, url);

            // Update chat interface if expanded
            if (this.isExpanded) {
                this.updateChatForNewVideo();
            }
        } catch (error) {
            console.error(
                'Failed to extract video context after retries:',
                error
            );
            if (this.isExpanded) {
                this.addSystemMessage(
                    'Failed to load video information. Please try refreshing the page.'
                );
            }
        }
    }

    isVideoPage() {
        const video = document.querySelector('video');
        const titleElement = document.querySelector(
            '#title h1.ytd-watch-metadata yt-formatted-string, h1.ytd-video-primary-info-renderer'
        );
        return !!(video && titleElement);
    }

    updateChatForNewVideo() {
        this.clearChatMessages();
        this.addCurrentVideoInfoToChat();
        this.addSystemMessage(
            "New video loaded! Ask me anything about this video's content."
        );
    }

    createChatInterface() {
        if (this.chatContainer) return;

        this.chatContainer = document.createElement('div');
        this.chatContainer.id = 'youtube-chat-assistant';
        this.chatContainer.className = 'youtube-chat-collapsed';

        this.chatContainer.innerHTML = `
      <div class="chat-toggle-btn" id="chat-toggle">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Chat about this video</span>
      </div>
      <div class="chat-panel" id="chat-panel">
        <div class="chat-header">
          <div class="chat-header-content">
            <h3>Video Chat Assistant</h3>
            <button class="history-btn" id="history-btn" title="View video history">📺</button>
          </div>
          <button class="close-btn" id="close-chat">&times;</button>
        </div>
        <div class="video-history" id="video-history" style="display: none;">
          <div class="history-header">
            <span>Recent Videos</span>
            <button class="history-close" id="history-close">×</button>
          </div>
          <div class="history-list" id="history-list"></div>
        </div>
        <div class="chat-messages" id="chat-messages">
          <div class="current-video-info" id="current-video-info">
            <div class="video-info-header">📹 Current Video</div>
            <div class="video-info-content">Loading video information...</div>
          </div>
          <div class="system-message">
            I can help you understand this video! Ask me anything about its content, concepts, or details.
          </div>
        </div>
        <div class="chat-input-container">
          <input type="text" id="chat-input" placeholder="Ask about this video..." />
          <button id="send-btn">Send</button>
        </div>
        <div class="chat-loading" id="chat-loading" style="display: none;">
          <div class="loading-dots">
            <span></span><span></span><span></span>
          </div>
        </div>
      </div>
    `;

        document.body.appendChild(this.chatContainer);

        this.attachEventListeners();
    }

    attachEventListeners() {
        const toggleBtn = document.getElementById('chat-toggle');
        const closeBtn = document.getElementById('close-chat');
        const sendBtn = document.getElementById('send-btn');
        const chatInput = document.getElementById('chat-input');
        const historyBtn = document.getElementById('history-btn');
        const historyClose = document.getElementById('history-close');

        toggleBtn?.addEventListener('click', () => this.toggleChat());
        closeBtn?.addEventListener('click', () => this.toggleChat());
        sendBtn?.addEventListener('click', () => this.sendMessage());
        historyBtn?.addEventListener('click', () => this.toggleVideoHistory());
        historyClose?.addEventListener('click', () =>
            this.toggleVideoHistory()
        );

        chatInput?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });
    }

    toggleChat() {
        if (!this.chatContainer) return;

        this.isExpanded = !this.isExpanded;

        if (this.isExpanded) {
            this.chatContainer.className = 'youtube-chat-expanded';

            // Always check if context needs updating when expanding chat
            const currentUrl = window.location.href;
            if (!this.videoData || this.videoData.url !== currentUrl) {
                console.info(
                    'Extracting video context - no data or URL changed'
                );

                // Clear existing messages first
                this.clearChatMessages();

                // Extract new context
                this.extractVideoContext().then(() => {
                    // Add fresh content
                    this.addCurrentVideoInfoToChat();
                    this.addSystemMessage(
                        'I can help you understand this video! Ask me anything about its content, concepts, or details.'
                    );
                });
            }
        } else {
            this.chatContainer.className = 'youtube-chat-collapsed';
        }
    }

    async extractVideoContextWithRetry(videoId, url) {
        const promise = this.createCancellablePromise(
            async (resolve, reject, isCancelled) => {
                for (
                    let attempt = 0;
                    attempt <= this.maxContextRetries;
                    attempt++
                ) {
                    if (isCancelled()) {
                        console.info('Context extraction cancelled');
                        reject(new Error('Extraction cancelled'));
                        return;
                    }

                    try {
                        console.info(
                            `Extracting video context (attempt ${attempt + 1}/${this.maxContextRetries + 1})...`
                        );

                        // Wait for elements to be available with exponential backoff
                        const waitTime = Math.min(
                            1000 * Math.pow(2, attempt),
                            5000
                        );
                        await this.waitForVideoElements(waitTime);

                        if (isCancelled()) return;

                        const contextData = await this.extractVideoContext(
                            videoId,
                            url
                        );

                        if (this.validateContextData(contextData)) {
                            this.videoData = contextData;
                            this.updateVideoHistory(contextData);
                            this.updateCurrentVideoInfo();

                            // Attempt transcript extraction (non-blocking)
                            this.attemptTranscriptExtraction().catch((err) =>
                                console.warn(
                                    'Transcript extraction failed:',
                                    err
                                )
                            );

                            resolve(contextData);
                            return;
                        } else if (attempt === this.maxContextRetries) {
                            throw new Error(
                                'Invalid context data after all retries'
                            );
                        }
                    } catch (error) {
                        console.error(
                            `Context extraction attempt ${attempt + 1} failed:`,
                            error
                        );
                        if (attempt === this.maxContextRetries) {
                            // Final fallback with minimal data
                            this.videoData = this.createFallbackContext(
                                videoId,
                                url
                            );
                            resolve(this.videoData);
                            return;
                        }
                    }

                    // Wait before retry (exponential backoff)
                    if (attempt < this.maxContextRetries) {
                        await new Promise((r) =>
                            setTimeout(r, 500 * Math.pow(2, attempt))
                        );
                    }
                }
            }
        );

        this.contextExtractionPromise = promise;
        return promise;
    }

    createCancellablePromise(executor) {
        const isCancelled = false;

        const promise = new Promise((resolve, reject) => {
            const checkCancelled = () =>
                isCancelled ||
                (this.contextExtractionPromise &&
                    this.contextExtractionPromise.cancelled);
            executor(resolve, reject, checkCancelled);
        });

        promise.cancelled = false;
        return promise;
    }

    async waitForVideoElements(maxWaitTime = 3000) {
        const startTime = Date.now();

        return new Promise((resolve) => {
            const checkElements = () => {
                const video = document.querySelector('video');
                const title = document.querySelector(
                    '#title h1.ytd-watch-metadata yt-formatted-string, h1.ytd-video-primary-info-renderer'
                );

                if (video && title && title.textContent?.trim()) {
                    resolve({ video, title });
                } else if (Date.now() - startTime < maxWaitTime) {
                    setTimeout(checkElements, 100);
                } else {
                    resolve({ video: null, title: null });
                }
            };

            checkElements();
        });
    }

    async extractVideoContext(videoId, url) {
        const video = document.querySelector('video');
        const title = document
            .querySelector(
                '#title h1.ytd-watch-metadata yt-formatted-string, h1.ytd-video-primary-info-renderer'
            )
            ?.textContent?.trim();
        const description = document
            .querySelector(
                '#description-text, #description yt-formatted-string'
            )
            ?.textContent?.trim();
        const channel = document
            .querySelector('#channel-name a, #owner-text a')
            ?.textContent?.trim();
        const duration = video?.duration;
        const currentTime = video?.currentTime;

        const contextData = {
            id: videoId,
            title: title || 'Loading...',
            description: description || 'Description not yet available',
            channel: channel || 'Channel loading...',
            duration: duration || 0,
            currentTime: currentTime || 0,
            url: url,
            timestamp: Date.now(),
        };

        console.info('Video context extracted:', {
            title: contextData.title,
            channel: contextData.channel,
            id: contextData.id,
            hasVideo: !!video,
        });

        return contextData;
    }

    validateContextData(data) {
        return (
            data &&
            data.id &&
            data.id !== 'unknown' &&
            data.title &&
            data.title !== 'Loading...' &&
            data.title.length > 0 &&
            !data.title.startsWith('Error')
        );
    }

    createFallbackContext(videoId, url) {
        return {
            id: videoId || 'unknown',
            title: 'Video Title Loading...',
            description:
                'Video information is still loading. You can start chatting, but context may be limited.',
            channel: 'Channel information loading...',
            duration: 0,
            currentTime: 0,
            url: url,
            timestamp: Date.now(),
        };
    }

    async attemptTranscriptExtraction() {
        try {
            const transcriptButton = document.querySelector(
                'button[aria-label*="transcript" i], button[aria-label*="Show transcript" i]'
            );
            if (transcriptButton) {
                transcriptButton.click();

                setTimeout(() => {
                    const transcriptText = Array.from(
                        document.querySelectorAll(
                            '.ytd-transcript-segment-renderer'
                        )
                    )
                        .map((segment) => segment.textContent?.trim())
                        .filter((text) => text)
                        .join(' ');

                    if (transcriptText) {
                        this.videoData.transcript = transcriptText;
                    }
                }, 2000);
            }
        } catch (error) {
            console.error('Could not extract transcript:', error);
        }
    }

    async sendMessage(customMessage = null) {
        const input = document.getElementById('chat-input');
        const message = customMessage || input?.value?.trim();

        if (!message) return;

        if (!customMessage) {
            input.value = '';
        }

        this.addMessageToChat('user', message);
        this.showLoading(true);

        try {
            const response = await this.processMessage(message);
            this.addMessageToChat('assistant', response, message);
        } catch (error) {
            this.addMessageToChat(
                'system',
                'Sorry, I encountered an error processing your message. Please try again.'
            );
            console.error('Chat error:', error);
        } finally {
            this.showLoading(false);
        }
    }

    async processMessage(message) {
        try {
            // Get API key from storage
            const result = await chrome.storage.sync.get(['geminiApiKey']);
            const apiKey = result.geminiApiKey;

            if (!apiKey) {
                return 'Please set your Gemini API key in the extension popup (click the extension icon) to start chatting about videos.';
            }

            // Send message to background script for Gemini API call
            return new Promise((resolve, reject) => {
                chrome.runtime.sendMessage(
                    {
                        action: 'sendToGemini',
                        data: {
                            message: message,
                            videoContext: this.videoData,
                            apiKey: apiKey,
                        },
                    },
                    (response) => {
                        if (chrome.runtime.lastError) {
                            reject(new Error(chrome.runtime.lastError.message));
                            return;
                        }

                        if (response.success) {
                            resolve(response.data);
                        } else {
                            reject(
                                new Error(
                                    response.error || 'Unknown error occurred'
                                )
                            );
                        }
                    }
                );
            });
        } catch (error) {
            console.error('Error processing message:', error);
            throw error;
        }
    }

    addMessageToChat(sender, message, originalQuery = null) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        this.messageCounter++;
        const messageId = `message-${this.messageCounter}`;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.id = messageId;

        let messageHTML = `<div class="message-content" data-selectable="true">${this.escapeHtml(message)}</div>`;

        // Add action buttons for user messages (edit) and assistant messages (retry)
        if (sender === 'user') {
            messageHTML += `
        <div class="message-actions">
          <button class="action-btn edit-btn" onclick="youtubeVideoChat.editMessage('${messageId}', '${this.escapeHtml(message).replace(/'/g, '&#39;')}')" title="Edit message">✏️</button>
        </div>`;
        } else if (sender === 'assistant' && originalQuery) {
            messageHTML += `
        <div class="message-actions">
          <button class="action-btn retry-btn" onclick="youtubeVideoChat.retryMessage('${this.escapeHtml(originalQuery).replace(/'/g, '&#39;')}')" title="Retry query">🔄</button>
        </div>`;
        }

        messageDiv.innerHTML = messageHTML;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        return messageId;
    }

    showLoading(show) {
        const loading = document.getElementById('chat-loading');
        if (loading) {
            loading.style.display = show ? 'flex' : 'none';
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clearChatMessages() {
        const messagesContainer = document.getElementById('chat-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            this.messageCounter = 0;
        }
    }

    addSystemMessage(message) {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = 'system-message';
        messageDiv.innerHTML = this.escapeHtml(message);

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    addCurrentVideoInfoToChat() {
        const messagesContainer = document.getElementById('chat-messages');
        if (!messagesContainer || !this.videoData) return;

        const videoInfoDiv = document.createElement('div');
        videoInfoDiv.className = 'current-video-info';
        videoInfoDiv.id = 'current-video-info';
        videoInfoDiv.innerHTML = `
      <div class="video-info-header">📹 Current Video</div>
      <div class="video-info-content">
        <div class="current-video-details">
          <div class="video-title">${this.escapeHtml(this.videoData.title)}</div>
          <div class="video-meta">
            <span class="channel">${this.escapeHtml(this.videoData.channel)}</span>
            <span class="separator">•</span>
            <span class="duration">${this.formatDuration(this.videoData.duration)}</span>
          </div>
        </div>
      </div>
    `;

        messagesContainer.insertBefore(
            videoInfoDiv,
            messagesContainer.firstChild
        );
    }

    updateVideoHistory(videoData) {
        // Don't add if it's the same as the current video
        if (this.currentVideoId === videoData.id) return;

        // Remove if this video already exists in history
        this.videoHistory = this.videoHistory.filter(
            (v) => v.id !== videoData.id
        );

        // Add current video to history
        this.videoHistory.push({
            id: videoData.id,
            title: videoData.title,
            channel: videoData.channel,
            url: videoData.url,
            timestamp: videoData.timestamp,
            duration: this.formatDuration(videoData.duration),
        });

        // Keep only last 10 videos
        if (this.videoHistory.length > 10) {
            this.videoHistory = this.videoHistory.slice(-10);
        }

        this.currentVideoId = videoData.id;
        this.saveVideoHistory();
    }

    updateCurrentVideoInfo() {
        const infoElement = document.getElementById('current-video-info');
        if (infoElement && this.videoData) {
            const contentElement = infoElement.querySelector(
                '.video-info-content'
            );
            if (contentElement) {
                contentElement.innerHTML = `
          <div class="current-video-details">
            <div class="video-title">${this.escapeHtml(this.videoData.title)}</div>
            <div class="video-meta">
              <span class="channel">${this.escapeHtml(this.videoData.channel)}</span>
              <span class="separator">•</span>
              <span class="duration">${this.formatDuration(this.videoData.duration)}</span>
            </div>
          </div>
        `;
            }
        }
    }

    toggleVideoHistory() {
        const historyPanel = document.getElementById('video-history');
        const chatMessages = document.getElementById('chat-messages');

        if (historyPanel && chatMessages) {
            const isVisible = historyPanel.style.display !== 'none';

            if (isVisible) {
                historyPanel.style.display = 'none';
                chatMessages.style.display = 'block';
            } else {
                this.renderVideoHistory();
                historyPanel.style.display = 'block';
                chatMessages.style.display = 'none';
            }
        }
    }

    renderVideoHistory() {
        const historyList = document.getElementById('history-list');
        if (!historyList) return;

        if (this.videoHistory.length === 0) {
            historyList.innerHTML =
                '<div class="no-history">No video history yet</div>';
            return;
        }

        const historyItems = [...this.videoHistory]
            .reverse()
            .map(
                (video) => `
      <div class="history-item" data-video-id="${video.id}" data-url="${video.url}">
        <div class="history-video-info">
          <div class="history-title">${this.escapeHtml(video.title)}</div>
          <div class="history-meta">
            <span class="history-channel">${this.escapeHtml(video.channel)}</span>
            <span class="separator">•</span>
            <span class="history-duration">${video.duration}</span>
            <span class="separator">•</span>
            <span class="history-time">${this.formatTimeAgo(video.timestamp)}</span>
          </div>
        </div>
        <button class="history-goto" data-url="${video.url}" title="Go to video">→</button>
      </div>
    `
            )
            .join('');

        historyList.innerHTML = historyItems;

        // Add click handlers for history items
        historyList.addEventListener('click', (e) => {
            const gotoBtn = e.target.closest('.history-goto');
            if (gotoBtn) {
                const url = gotoBtn.dataset.url;
                if (url) {
                    window.location.href = url;
                }
            }
        });
    }

    formatDuration(seconds) {
        if (!seconds || seconds === 0) return '0:00';

        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const remainingSeconds = Math.floor(seconds % 60);

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }
    }

    formatTimeAgo(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'Just now';
    }

    editMessage(messageId, originalText) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;

        const contentElement = messageElement.querySelector('.message-content');
        if (!contentElement) return;

        // Create edit input
        const editInput = document.createElement('input');
        editInput.type = 'text';
        editInput.className = 'edit-input';
        editInput.value = originalText;
        editInput.maxLength = 500;

        // Create action buttons
        const editActions = document.createElement('div');
        editActions.className = 'edit-actions';
        editActions.innerHTML = `
      <button class="edit-save-btn" onclick="youtubeVideoChat.saveEdit('${messageId}')">✓</button>
      <button class="edit-cancel-btn" onclick="youtubeVideoChat.cancelEdit('${messageId}', '${originalText.replace(/'/g, '&#39;')}')">✕</button>
    `;

        // Replace content with edit interface
        contentElement.style.display = 'none';
        messageElement.querySelector('.message-actions').style.display = 'none';

        contentElement.parentNode.insertBefore(
            editInput,
            contentElement.nextSibling
        );
        contentElement.parentNode.insertBefore(
            editActions,
            editInput.nextSibling
        );

        editInput.focus();
        editInput.select();

        // Handle Enter key
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.saveEdit(messageId);
            } else if (e.key === 'Escape') {
                this.cancelEdit(messageId, originalText);
            }
        });
    }

    saveEdit(messageId) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;

        const editInput = messageElement.querySelector('.edit-input');
        const newText = editInput.value.trim();

        if (!newText) return;

        // Remove following assistant messages (if any)
        this.removeFollowingMessages(messageElement);

        // Update the message content
        const contentElement = messageElement.querySelector('.message-content');
        contentElement.innerHTML = this.escapeHtml(newText);
        contentElement.style.display = 'block';

        // Update the edit button with new text
        const editBtn = messageElement.querySelector('.edit-btn');
        editBtn.setAttribute(
            'onclick',
            `youtubeVideoChat.editMessage('${messageId}', '${this.escapeHtml(newText).replace(/'/g, '&#39;')}')`
        );

        // Clean up edit interface
        editInput.remove();
        messageElement.querySelector('.edit-actions').remove();
        messageElement.querySelector('.message-actions').style.display =
            'block';

        // Send the edited message
        this.sendMessage(newText);
    }

    cancelEdit(messageId, originalText) {
        const messageElement = document.getElementById(messageId);
        if (!messageElement) return;

        const contentElement = messageElement.querySelector('.message-content');
        contentElement.innerHTML = this.escapeHtml(originalText);
        contentElement.style.display = 'block';

        // Clean up edit interface
        const editInput = messageElement.querySelector('.edit-input');
        const editActions = messageElement.querySelector('.edit-actions');
        if (editInput) editInput.remove();
        if (editActions) editActions.remove();

        messageElement.querySelector('.message-actions').style.display =
            'block';
    }

    retryMessage(originalQuery) {
        // Remove the last assistant message
        const messages = document.querySelectorAll('.assistant-message');
        const lastAssistantMessage = messages[messages.length - 1];
        if (lastAssistantMessage) {
            lastAssistantMessage.remove();
        }

        // Resend the query
        this.sendMessage(originalQuery);
    }

    removeFollowingMessages(fromElement) {
        let nextElement = fromElement.nextElementSibling;
        while (nextElement) {
            const toRemove = nextElement;
            nextElement = nextElement.nextElementSibling;
            if (
                toRemove.classList.contains('message') ||
                toRemove.classList.contains('system-message')
            ) {
                toRemove.remove();
            }
        }
    }

    removeChatInterface() {
        if (this.chatContainer) {
            this.chatContainer.remove();
            this.chatContainer = null;
            this.isExpanded = false;
            this.videoData = null;
        }
    }
}

if (typeof window !== 'undefined') {
    window.youtubeVideoChat = new YouTubeVideoChat();
}
