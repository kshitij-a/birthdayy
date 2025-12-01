
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Loader2, Bot, User, RefreshCw } from 'lucide-react';
import { createChatSession, convertConversationToData } from '../services/geminiService';
import { BirthdayData } from '../types';
import { Chat } from "@google/genai";

interface ChatInterfaceProps {
  onComplete: (data: BirthdayData) => void;
}

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ onComplete }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  // Ref for the AI chat session
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  // Initialize Chat Session on Mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const initChat = async () => {
        try {
            const chat = await createChatSession();
            chatSessionRef.current = chat;
            
            setIsTyping(true);
            // Send empty message to trigger the greeting from the system instruction
            // Fix: sendMessage expects an object with a 'message' property
            const result = await chat.sendMessage({ message: "Start the interview." });
            setIsTyping(false);
            
            setMessages([{
                id: crypto.randomUUID(),
                sender: 'ai',
                text: result.text || "Hello! I'm your AI Birthday Planner. Let's create something magical! First, who is this birthday page for?"
            }]);
        } catch (e) {
            console.error("Failed to init chat", e);
            setHasError(true);
        }
    };

    initChat();
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, hasError]);

  const handleSend = async () => {
    if (!inputValue.trim() || !chatSessionRef.current) return;

    const userText = inputValue;
    const userMsg: Message = { id: crypto.randomUUID(), sender: 'user', text: userText };
    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    try {
        // Fix: sendMessage expects an object with a 'message' property
        const result = await chatSessionRef.current.sendMessage({ message: userText });
        const aiText = result.text || "";

        // Check for completion signal
        if (aiText.includes('[DONE]')) {
            // Remove the [DONE] tag for the UI if it's mixed with text
            const cleanText = aiText.replace('[DONE]', '').trim();
            if (cleanText) {
                 setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: cleanText }]);
            }
            // Trigger generation
            finishChat();
        } else {
            setMessages(prev => [...prev, { id: crypto.randomUUID(), sender: 'ai', text: aiText }]);
            setIsTyping(false);
        }

    } catch (error) {
        console.error("Chat Error", error);
        setIsTyping(false);
        setHasError(true);
    }
  };

  const finishChat = async () => {
    setIsGenerating(true);
    setIsTyping(false);
    
    // We pass the local state messages to ensure we capture the full context correctly
    // independently of the SDK's internal history format
    try {
        const data = await convertConversationToData(messages);
        onComplete(data);
    } catch (error) {
        console.error(error);
        setHasError(true);
        setMessages(prev => [...prev, {
            id: crypto.randomUUID(),
            sender: 'ai',
            text: "Oops, I had a little trouble building the site. Please try clicking 'Retry'."
        }]);
        setIsGenerating(false);
    }
  };

  const handleRetry = () => {
      setHasError(false);
      finishChat();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[600px] bg-black/40 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl shadow-pink-500/10 ring-1 ring-white/5">
      {/* Header with gradient underline */}
      <div className="bg-white/5 border-b border-white/10 p-4 flex items-center gap-3 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50"></div>
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/20 animate-pulse-slow">
            <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div>
            <h3 className="text-white font-bold text-lg tracking-wide">AI Storyteller</h3>
            <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-xs text-pink-200/70 font-medium">Online & Creative</p>
            </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-3 animate-[slideUp_0.4s_ease-out_forwards] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
             <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-md ${
                 msg.sender === 'ai' 
                    ? 'bg-gradient-to-br from-gray-800 to-black border border-white/10 text-pink-400' 
                    : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-pink-500/20'
             }`}>
                {msg.sender === 'ai' ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
             </div>
             
             <div className={`max-w-[80%] rounded-2xl p-4 text-sm md:text-base leading-relaxed shadow-lg relative overflow-hidden group ${
                msg.sender === 'ai' 
                    ? 'bg-gray-900/80 backdrop-blur border border-white/5 text-gray-100 rounded-tl-none' 
                    : 'bg-pink-600 text-white rounded-tr-none'
             }`}>
                {msg.sender === 'ai' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-shine pointer-events-none" />
                )}
                {msg.text}
             </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex gap-3 animate-[slideUp_0.4s_ease-out_forwards]">
             <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-800 to-black border border-white/10 flex items-center justify-center text-pink-400 shadow-md">
                <Bot className="w-5 h-5" />
             </div>
             <div className="bg-gray-900/80 backdrop-blur border border-white/5 rounded-2xl rounded-tl-none p-4 flex gap-1.5 items-center">
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
             </div>
          </div>
        )}
        
        {hasError && (
            <div className="flex justify-center mt-4">
                <button 
                    onClick={handleRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30 transition-colors"
                >
                    <RefreshCw className="w-4 h-4" /> Retry Generation
                </button>
            </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/40 border-t border-white/10 backdrop-blur-md">
         {isGenerating ? (
            <div className="flex flex-col items-center justify-center gap-3 text-pink-400 py-6 animate-pulse">
                <div className="relative">
                    <div className="absolute inset-0 bg-pink-500 blur-xl opacity-20 animate-pulse"></div>
                    <Loader2 className="w-8 h-8 animate-spin relative z-10" />
                </div>
                <span className="font-medium tracking-wide">Analysing favorite color & building theme...</span>
            </div>
         ) : (
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-500 to-purple-600 rounded-xl opacity-20 group-hover:opacity-40 transition duration-500 blur"></div>
                <div className="relative flex gap-2 bg-gray-900/90 rounded-xl p-1.5">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Type your answer here..."
                        className="flex-1 bg-transparent border-none rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-0"
                        autoFocus
                        disabled={hasError}
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputValue.trim() || hasError}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-all shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 active:scale-95"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>
         )}
      </div>
    </div>
  );
};
