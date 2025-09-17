import React, { createContext, useContext, useEffect, useState } from 'react';

import initialChatsAsset from '../assets/chats.json';

const MessagesContext = createContext();

const API_URL = 'http://localhost:8000/generate-stream';

export function useMessages() {
    const context = useContext(MessagesContext);
    if (!context) {
        throw new Error('useMessages must be used within a MessagesProvider');
    }
    return context;
}

function persistChats(chats) {
    try {
        localStorage.setItem('chats', JSON.stringify(chats));
    } catch (e) {
        console.warn('Could not persist chats to localStorage', e);
    }
}

export function MessagesProvider({ children }) {
    // chats: array of { title: string, content: string } where content is a JSON stringified messages array
    const [chats, _setChats] = useState([]);
    // Wrap setChats to persist immediately
    const setChats = (newChats) => {
        _setChats(newChats);
        try {
            localStorage.setItem('chats', JSON.stringify(newChats));
        } catch (e) {
            console.warn('Could not persist chats to localStorage', e);
        }
    };
    const [activeIndex, setActiveIndex] = useState(0);
    const [messages, setMessages] = useState([]); // messages for active chat (array of {role,content})
    const [isLeftPanelOpen, setIsLeftPanelOpen] = useState(true);
    const [isStreaming, setIsStreaming] = useState(false);

    // Load chats from localStorage or bundled asset on mount
    useEffect(() => {
        let loaded = [];
        try {
            const stored = localStorage.getItem('chats');
            if (stored) {
                loaded = JSON.parse(stored);
            } else if (initialChatsAsset && Array.isArray(initialChatsAsset) && initialChatsAsset.length) {
                loaded = initialChatsAsset;
            }
        } catch (e) {
            console.warn('Failed to load chats from storage/asset', e);
        }

        if (!loaded || !loaded.length) {
            // initialize with a default empty chat
            loaded = [{ title: 'New Chat', content: JSON.stringify([]) }];
        }

        setChats(loaded);
        setActiveIndex(0);
        // set messages to parsed content of active chat
        try {
            const first = loaded[0];
            setMessages(first && first.content ? JSON.parse(first.content) : []);
        } catch (e) {
            setMessages([]);
        }
    }, []);

    // Persist chats whenever they change
    useEffect(() => {
        if (chats && chats.length) persistChats(chats);
    }, [chats]);

    const selectChat = (index) => {
        if (index < 0 || index >= chats.length) return;
        setActiveIndex(index);
        try {
            const parsed = chats[index].content ? JSON.parse(chats[index].content) : [];
            setMessages(parsed);
        } catch (e) {
            setMessages([]);
        }
    };

    const newChat = () => {
        const newEntry = { title: `Chat ${new Date().toLocaleString()}`, content: JSON.stringify([]) };
        const updated = [newEntry, ...chats];
        setChats(updated);
        setActiveIndex(0);
        setMessages([]);
    };

    const saveCurrentChat = () => {
        try {
            const updated = [...chats];
            updated[activeIndex] = {
                ...updated[activeIndex],
                content: JSON.stringify(messages)
            };
            setChats(updated);
            persistChats(updated);
        } catch (e) {
            console.warn('Failed to save current chat', e);
        }
    };

    const sendMessage = async (userMessage) => {
        // Update local messages (append user message)
        setMessages(prev => {
            const next = [...prev, { role: 'user', content: userMessage }];
            return next;
        });

        // Start streaming indicator
        setIsStreaming(true);
        let streamedContent = '';

        // Build context string from current chat only
        const contextString = messages.map(m => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}: ${m.content}`).join('\n');
        // We'll append the new user message to the prompt so the model sees the full context
        const promptPayload = contextString ? contextString + '\nUSER: ' + userMessage : userMessage;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: `${activeIndex}`,
                    prompt: promptPayload,
                    max_tokens: 200,
                    temperature: 0.7,
                    new_context: true // replace server session with this chat-only context
                })
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            // Add an initial AI message that we'll update
            setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');
                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            streamedContent += data.token;
                            setMessages(prev => {
                                const newMessages = [...prev];
                                newMessages[newMessages.length - 1].content = streamedContent;
                                // Always back up using the latest messages array
                                setChats(chats => {
                                    const updatedChats = [...chats];
                                    updatedChats[activeIndex] = {
                                        ...updatedChats[activeIndex],
                                        content: JSON.stringify(newMessages)
                                    };
                                    return updatedChats;
                                });
                                return newMessages;
                            });
                        } catch (e) {
                            console.error('Error parsing SSE data:', e);
                        }
                    }
                }
            }

            // No need to call saveCurrentChat here; backup is handled above

        } catch (error) {
            console.error('Error:', error);
            setMessages(prev => [...prev, { role: 'system', content: 'Error: Could not connect to AI service.' }]);
        } finally {
            setIsStreaming(false);
        }
    };

    const value = {
        chats,
        setChats,
        activeIndex,
        selectChat,
        newChat,
        messages,
        setMessages,
        saveCurrentChat,
        isLeftPanelOpen,
        setIsLeftPanelOpen,
        sendMessage,
        isStreaming
    };

    return (
        <MessagesContext.Provider value={value}>
            {children}
        </MessagesContext.Provider>
    );
}