import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, AlertCircle, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
    documentId: string;
    isDarkMode: boolean;
}

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ documentId, isDarkMode }) => {
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

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.answer,
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
        <div className={`flex flex-col h-[600px] rounded-2xl border ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200 shadow-lg'}`}>
            {/* Header */}
            <div className={`p-4 border-b ${isDarkMode ? 'border-gray-800' : 'border-gray-100'}`}>
                <h3 className="font-semibold text-lg flex items-center">
                    <Bot className="w-5 h-5 mr-2 text-blue-500" />
                    Legal Assistant
                </h3>
                <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    Powered by Gemini 2.5 Flash • Ask about clauses & citations
                </p>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                        <div className={`flex max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 ${msg.role === 'user'
                                    ? 'bg-blue-600'
                                    : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')
                                }`}>
                                {msg.role === 'user' ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-blue-500" />}
                            </div>

                            <div className={`p-3 rounded-2xl text-sm ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : (isDarkMode ? 'bg-gray-800 text-gray-200 rounded-bl-none' : 'bg-gray-100 text-gray-800 rounded-bl-none')
                                }`}>
                                <div className="whitespace-pre-wrap">{msg.content}</div>
                                <div className={`text-[10px] mt-1 opacity-70 ${msg.role === 'user' ? 'text-blue-100' : 'text-gray-500'}`}>
                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
                {isLoading && (
                    <div className="flex justify-start">
                        <div className={`flex max-w-[80%] flex-row`}>
                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mx-2 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <Bot className="w-5 h-5 text-blue-500" />
                            </div>
                            <div className={`p-4 rounded-2xl rounded-bl-none ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
                            </div>
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
                        placeholder="Ask a question about this document..."
                        disabled={isLoading}
                        className={`flex-1 p-3 rounded-xl border focus:ring-2 focus:ring-blue-500 outline-none transition-all ${isDarkMode
                                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
                            }`}
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !input.trim()}
                        className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatInterface;
