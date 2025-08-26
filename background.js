class GeminiAPIHandler {
    constructor() {
        this.setupMessageListener();
    }

    setupMessageListener() {
        chrome.runtime.onMessage.addListener(
            (request, sender, sendResponse) => {
                if (request.action === 'sendToGemini') {
                    this.handleGeminiRequest(request.data)
                        .then((response) =>
                            sendResponse({ success: true, data: response })
                        )
                        .catch((error) =>
                            sendResponse({
                                success: false,
                                error: error.message,
                            })
                        );
                    return true; // Keep message channel open for async response
                }
            }
        );
    }

    async handleGeminiRequest(data) {
        const { message, videoContext, apiKey } = data;

        if (!apiKey) {
            throw new Error(
                'API key is required. Please set your Gemini API key in the extension popup.'
            );
        }

        const prompt = this.constructPrompt(message, videoContext);

        try {
            const response = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        contents: [
                            {
                                parts: [
                                    {
                                        text: prompt,
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.7,
                            topK: 40,
                            topP: 0.95,
                            maxOutputTokens: 1024,
                        },
                    }),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    `Gemini API error: ${errorData.error?.message || 'Unknown error'}`
                );
            }

            const result = await response.json();
            const generatedText =
                result.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!generatedText) {
                throw new Error('No response generated from Gemini');
            }

            return generatedText;
        } catch (error) {
            console.error('Gemini API error:', error);
            throw error;
        }
    }

    constructPrompt(userMessage, videoContext) {
        const context = videoContext
            ? `
YOUTUBE VIDEO CONTEXT:
Title: ${videoContext.title}
Channel: ${videoContext.channel}
Description: ${videoContext.description}
Duration: ${Math.floor(videoContext.duration || 0)} seconds
Current playback time: ${Math.floor(videoContext.currentTime || 0)} seconds
${videoContext.transcript ? `Video Transcript: ${videoContext.transcript}` : '(No transcript available)'}
URL: ${videoContext.url}

`
            : '';

        return `${context}You are a helpful AI assistant that specializes in answering questions about YouTube videos. Based on the video context provided above, please answer the user's question accurately and helpfully. If the video context doesn't contain enough information to answer the question, let the user know that and provide general helpful information if possible.

User Question: ${userMessage}

Please provide a clear, informative response that directly addresses the user's question about this video.`;
    }
}

// Initialize the API handler
new GeminiAPIHandler();
