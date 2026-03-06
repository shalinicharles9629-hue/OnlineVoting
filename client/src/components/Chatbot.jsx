import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Chatbot = () => {
    const { t } = useTranslation();
    const GREETING = t('chatbot.greeting');
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: GREETING, sender: "bot", isGreeting: true }
    ]);
    const [inputText, setInputText] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Focus input when chatbot opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!inputText.trim() || isTyping) return;

        const userMessage = inputText.trim();
        setMessages(prev => [...prev, { text: userMessage, sender: "user" }]);
        setInputText("");
        setIsTyping(true);

        // Add a placeholder message for the bot response
        setMessages(prev => [...prev, { text: "", sender: "bot", isStreaming: true }]);

        try {
            const historyToSend = messages
                .filter(msg => !msg.isGreeting && msg.text && (msg.sender === 'user' || msg.sender === 'bot'))
                .slice(-10);

            const url = new URL('http://localhost:5000/api/chatbot/stream');
            url.searchParams.append('text', userMessage);
            if (user?.email || user?.phone) {
                url.searchParams.append('identifier', user.email || user.phone);
            }
            url.searchParams.append('history', JSON.stringify(historyToSend));

            const response = await fetch(url);
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedResponse = "";
            let buffer = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop() || "";

                for (const line of lines) {
                    const trimmedLine = line.trim();
                    if (!trimmedLine || !trimmedLine.startsWith('data: ')) continue;

                    const dataStr = trimmedLine.slice(6).trim();
                    if (dataStr === '[DONE]') break;

                    try {
                        const data = JSON.parse(dataStr);
                        if (data.text) {
                            accumulatedResponse += data.text;
                            setMessages(prev => {
                                const newMessages = [...prev];
                                const lastMsg = newMessages[newMessages.length - 1];
                                if (lastMsg && lastMsg.isStreaming) {
                                    lastMsg.text = accumulatedResponse;
                                }
                                return newMessages;
                            });
                        }
                    } catch (e) {
                        console.error("Error parsing stream chunk:", e);
                    }
                }
            }

            // Finalize streaming
            setMessages(prev => {
                const newMessages = [...prev];
                const lastMsg = newMessages[newMessages.length - 1];
                if (lastMsg) delete lastMsg.isStreaming;
                return newMessages;
            });

        } catch (error) {
            console.error("Chatbot Error:", error);
            setMessages(prev => {
                const newMessages = [...prev];
                // Remove the empty streaming message if it exists
                if (newMessages[newMessages.length - 1]?.isStreaming) {
                    newMessages.pop();
                }
                newMessages.push({
                    text: t('chatbot.error_message'),
                    sender: "bot",
                    isError: true
                });
                return newMessages;
            });
        } finally {
            setIsTyping(false);
        }
    };

    const handleClearChat = () => {
        setMessages([{ text: GREETING, sender: "bot", isGreeting: true }]);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.85, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.85, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-4 flex flex-col"
                        style={{ maxHeight: '85vh' }}
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-gov-blue to-blue-700 p-4 flex justify-between items-center text-white shadow-lg flex-shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-2xl backdrop-blur-sm border border-white/10">
                                    🤖
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm leading-none">{t('chatbot.assistant_name')}</h3>
                                    <span className="text-[10px] text-blue-200 font-medium flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse"></span>
                                        {t('chatbot.status')}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {/* Clear Chat */}
                                <button
                                    onClick={handleClearChat}
                                    title={t('chatbot.clear_chat')}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors text-xs font-bold"
                                >
                                    🗑️
                                </button>
                                {/* Close */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {/* Messages Box */}
                        <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3" style={{ minHeight: '300px', maxHeight: '420px' }}>
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <motion.div
                                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        transition={{ duration: 0.2 }}
                                        className={`max-w-[85%] rounded-[1.25rem] px-4 py-3 text-sm leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-gov-blue text-white rounded-br-none'
                                            : msg.isError
                                                ? 'bg-red-50 text-red-600 border border-red-100 rounded-bl-none'
                                                : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                            }`}
                                    >
                                        {msg.sender === 'bot' ? (
                                            <div className="markdown-content text-gray-800 leading-relaxed">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                        ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                        ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                                        li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                                        h1: ({ node, ...props }) => <h1 className="text-base font-bold mb-1" {...props} />,
                                                        h2: ({ node, ...props }) => <h2 className="text-sm font-bold mb-1" {...props} />,
                                                        code: ({ node, inline, ...props }) =>
                                                            inline ?
                                                                <code className="bg-gray-100 px-1 rounded text-xs" {...props} /> :
                                                                <code className="block bg-gray-100 p-2 rounded text-xs my-2 overflow-x-auto" {...props} />
                                                    }}
                                                >
                                                    {msg.text || (msg.isStreaming ? "..." : "")}
                                                </ReactMarkdown>
                                            </div>
                                        ) : (
                                            msg.text
                                        )}
                                    </motion.div>
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-[1.25rem] rounded-bl-none px-4 py-3 flex gap-1 items-center shadow-sm">
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                        <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-gray-400 rounded-full" />
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick Prompts */}
                        <div className="px-3 py-2 bg-white border-t border-gray-50 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
                            {[t('chatbot.prompt1'), t('chatbot.prompt2'), t('chatbot.prompt3')].map(prompt => (
                                <button
                                    key={prompt}
                                    onClick={() => setInputText(prompt)}
                                    className="text-[11px] whitespace-nowrap bg-blue-50 hover:bg-blue-100 text-gov-blue font-semibold px-3 py-1.5 rounded-full transition-colors flex-shrink-0"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2 flex-shrink-0">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('chatbot.input_placeholder')}
                                className="flex-1 px-4 py-3 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gov-blue/30 text-sm border border-gray-100 transition-all font-medium"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!inputText.trim() || isTyping}
                                className="w-11 h-11 bg-gov-blue hover:bg-blue-700 disabled:bg-gray-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all shadow-md active:scale-95 flex-shrink-0"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 rotate-45 mr-0.5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Float Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 bg-gradient-to-br from-gov-blue to-blue-700 text-white rounded-2xl shadow-2xl flex items-center justify-center text-3xl hover:shadow-blue-500/30 transition-all border-4 border-white/50 relative"
            >
                <AnimatePresence mode="wait">
                    <motion.span
                        key={isOpen ? 'close' : 'open'}
                        initial={{ scale: 0, rotate: -90 }}
                        animate={{ scale: 1, rotate: 0 }}
                        exit={{ scale: 0, rotate: 90 }}
                        transition={{ duration: 0.15 }}
                    >
                        {isOpen ? '✕' : '💬'}
                    </motion.span>
                </AnimatePresence>
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-bounce" />
                )}
            </motion.button>
        </div>
    );
};

export default Chatbot;
