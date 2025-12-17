import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, Loader2 } from 'lucide-react';

interface Citation {
    page: number;
    text?: string;
    preview: string;
}

interface ChatInterfaceProps {
    documentId: string;
    isDarkMode: boolean;
    onCitationClick?: (page: number, text?: string) => void;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    citations?: Citation[];
    timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentId, isDarkMode, onCitationClick }) => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: 'Hello! I have analyzed this document. Ask me anything about specific clauses, obligations, or risks.',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://saralvakeel.onrender.com';
            const response = await fetch(`${API_URL}/query-document`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    document_name: documentId,
                    question: userMessage.content
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();

            // Backend returns { answer: string, citations: [{page: int, ...}] }
            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
                citations: data.citations || [],
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error extracting that information. Please try again.',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={`flex flex-col h-full rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <h3 className="font-semibold text-lg flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-blue-500" />
                    Legal Assistant
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Powered by RAG • Citations enabled
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[90%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 ${msg.role === 'user'
                                ? 'bg-blue-600'
                                : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-500" />}
                            </div>

                            <div className={`flex flex-col`}>
                                <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : (isDarkMode ? 'bg-gray-800 text-gray-200 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none')
                                    }`}>
                                    <div className="whitespace-pre-wrap">{msg.content}</div>
                                </div>

                                {/* Render Citations */}
                                {msg.role === 'assistant' && msg.citations && msg.citations.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2 ml-1">
                                        {msg.citations.map((cite, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => onCitationClick?.(cite.page, cite.text)}
                                                className="flex items-center px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors border border-blue-200"
                                            >
                                                <AlertCircle className="w-3 h-3 mr-1" />
                                                Page {cite.page}
                                            </button>
                                        ))}
                                    </div>
                                )}

                                <div className={`text-[10px] mt-1 ml-1 opacity-70 ${msg.role === 'user' ? 'text-right' : 'text-left'} ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className="flex items-center space-x-2 ml-12 p-3">
                            <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                            <span className="text-xs text-gray-400">Analyzing document...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={handleSendMessage} className={`p-4 border-t ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        disabled={isLoading}
                        className={`flex-1 p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode
                            ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                            }`}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
