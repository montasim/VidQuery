document.addEventListener('DOMContentLoaded', () => {
    const apiKeyInput = document.getElementById('apiKey');
    const saveBtn = document.getElementById('saveBtn');
    const status = document.getElementById('status');

    // Load existing API key
    loadApiKey();

    // Save button click handler
    saveBtn.addEventListener('click', saveApiKey);

    // Save without validation button handler
    document
        .getElementById('saveWithoutValidation')
        .addEventListener('click', saveApiKeyWithoutValidation);

    // Enter key handler
    apiKeyInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveApiKey();
        }
    });

    async function loadApiKey() {
        try {
            const result = await chrome.storage.sync.get(['geminiApiKey']);
            if (result.geminiApiKey) {
                apiKeyInput.value = result.geminiApiKey;
                showStatus('API key loaded successfully', 'success');
            }
        } catch (error) {
            console.error('Error loading API key:', error);
            showStatus('Error loading saved API key', 'error');
        }
    }

    async function saveApiKey() {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            showStatus('Please enter a valid API key', 'error');
            return;
        }

        // Basic validation - Gemini API keys typically start with "AI" and are quite long
        if (apiKey.length < 20) {
            showStatus(
                'API key appears to be too short. Please check your key.',
                'error'
            );
            return;
        }

        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            // Test the API key by making a simple request
            await testApiKey(apiKey);

            // If test passes, save the key
            await chrome.storage.sync.set({ geminiApiKey: apiKey });
            showStatus(
                'API key saved and validated successfully! 🎉',
                'success'
            );
        } catch (error) {
            console.error('Error saving API key:', error);
            showStatus(
                error.message || 'Error validating API key. Please try again.',
                'error'
            );
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = 'Save Configuration';
        }
    }

    async function saveApiKeyWithoutValidation() {
        const apiKey = apiKeyInput.value.trim();

        if (!apiKey) {
            showStatus('Please enter an API key', 'error');
            return;
        }

        try {
            await chrome.storage.sync.set({ geminiApiKey: apiKey });
            showStatus(
                'API key saved (validation skipped). Try chatting on YouTube to test!',
                'success'
            );
        } catch (error) {
            console.error('Error saving API key:', error);
            showStatus('Error saving API key to storage', 'error');
        }
    }

    async function testApiKey(apiKey) {
        console.info('Testing API key...');

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
                                        text: 'Test',
                                    },
                                ],
                            },
                        ],
                        generationConfig: {
                            temperature: 0.1,
                            maxOutputTokens: 5,
                        },
                    }),
                }
            );

            console.info('API Response status:', response.status);

            if (!response.ok) {
                let errorMessage = 'Unknown error';
                try {
                    const errorData = await response.json();
                    console.info('API Error details:', errorData);
                    errorMessage =
                        errorData.error?.message || `HTTP ${response.status}`;

                    if (
                        response.status === 400 &&
                        errorMessage.includes('API key not valid')
                    ) {
                        throw new Error(
                            'Invalid API key format. Please check your Gemini API key.'
                        );
                    } else if (response.status === 403) {
                        throw new Error(
                            'API key access denied. Make sure the key is active and has proper permissions.'
                        );
                    } else if (response.status === 429) {
                        throw new Error(
                            'API quota exceeded. Please check your usage limits.'
                        );
                    }
                } catch (parseError) {
                    console.error(
                        'Could not parse error response:',
                        parseError
                    );
                }

                throw new Error(
                    `API validation failed (${response.status}): ${errorMessage}`
                );
            }

            await response.json();
            console.info('API test successful');
            return true;
        } catch (networkError) {
            console.error('Network error during API test:', networkError);
            if (networkError.message.includes('Failed to fetch')) {
                throw new Error(
                    'Network error: Please check your internet connection and try again.'
                );
            }
            throw networkError;
        }
    }

    function showStatus(message, type) {
        status.textContent = message;
        status.className = `status ${type}`;
        status.style.display = 'block';

        // Hide status after 5 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                status.style.display = 'none';
            }, 5000);
        }
    }
});
