import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import { generateChatResponse } from '../services/geminiService';

interface ChatbotProps {
    topic: string;
    language: string;
    t: (key: string) => string;
}

const Chatbot: React.FC<ChatbotProps> = ({ topic, language, t }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);
    
    // Clear chat when topic changes
    useEffect(() => {
        setMessages([]);
    }, [topic]);

    const handleSend = async () => {
        if (input.trim() === '' || isLoading) return;

        const newUserMessage: ChatMessage = { role: 'user', text: input };
        setMessages(prev => [...prev, newUserMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const responseText = await generateChatResponse(topic, language, messages, input);
            const newModelMessage: ChatMessage = { role: 'model', text: responseText };
            setMessages(prev => [...prev, newModelMessage]);
        } catch (error) {
            const errorMessage: ChatMessage = { role: 'model', text: 'Sorry, I encountered an error. Please try again.' };
            setMessages(prev => [...prev, errorMessage]);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5z" />
                    <path d="M4 12a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                    <path fillRule="evenodd" d="M18 17a1 1 0 001-1v-2a1 1 0 00-2 0v2a1 1 0 001 1zM5 17a1 1 0 01-1-1v-2a1 1 0 112 0v2a1 1 0 01-1 1z" clipRule="evenodd" />
                </svg>
                {t('chatbotTitle')}
            </h3>
            <div className="h-64 bg-slate-100 dark:bg-slate-900/50 rounded-lg p-3 overflow-y-auto flex flex-col space-y-3">
                {messages.length === 0 && (
                    <div className="m-auto text-center text-sm text-slate-500 dark:text-slate-400">
                        {t('chatbotWelcome')}
                    </div>
                )}
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                            msg.role === 'user' 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm'
                        }`}>
                            {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 shadow-sm flex items-center">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0s' }}></span>
                            <span className="w-2 h-2 ml-1 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.15s' }}></span>
                            <span className="w-2 h-2 ml-1 bg-slate-400 rounded-full animate-pulse" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder={t('chatbotPlaceholder')}
                    className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                    disabled={isLoading}
                />
                <button
                    onClick={handleSend}
                    disabled={isLoading || input.trim() === ''}
                    className="bg-primary-600 text-white p-2 rounded-md hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
                    aria-label={t('chatbotSend')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                    </svg>
                </button>
            </div>
        </div>
    );
};

export default Chatbot;
