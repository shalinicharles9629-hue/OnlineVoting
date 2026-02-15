import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { text: "Hello! How can I help you with the voting process today?", sender: "bot" }
    ]);
    const [inputText, setInputText] = useState("");

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputText.trim()) return;

        const newMessages = [...messages, { text: inputText, sender: "user" }];
        setMessages(newMessages);
        setInputText("");

        // Simulate bot response
        setTimeout(() => {
            let botResponse = "I can help you with registration, voting, or general queries.";
            if (inputText.toLowerCase().includes("register")) {
                botResponse = "To register, click on the 'Register' button on the top right. You'll need a valid ID.";
            } else if (inputText.toLowerCase().includes("vote")) {
                botResponse = "Voting lines are open! Go to your dashboard to see active elections.";
            } else if (inputText.toLowerCase().includes("result")) {
                botResponse = "Results will be declared after the election period ends. Check the Results page.";
            }
            setMessages([...newMessages, { text: botResponse, sender: "bot" }]);
        }, 1000);
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="bg-white w-80 md:w-96 rounded-2xl shadow-2xl border border-gray-200 overflow-hidden mb-4"
                    >
                        <div className="bg-gradient-to-r from-gov-blue to-blue-700 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                    🤖
                                </div>
                                <h3 className="font-bold">Election Assistant</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-white hover:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <div className="h-80 overflow-y-auto p-4 bg-gray-50 flex flex-col gap-3">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${msg.sender === 'user'
                                            ? 'bg-gov-blue text-white rounded-br-none'
                                            : 'bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-100'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-100 flex gap-2">
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                placeholder="Type your query..."
                                className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-100 text-sm"
                            />
                            <button type="submit" className="w-10 h-10 bg-gov-orange hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition shadow-md">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                </svg>
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-gradient-to-r from-gov-blue to-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-3xl hover:shadow-xl transition-all border-2 border-white"
            >
                {isOpen ? '✕' : '💬'}
            </motion.button>
        </div>
    );
};

export default Chatbot;
