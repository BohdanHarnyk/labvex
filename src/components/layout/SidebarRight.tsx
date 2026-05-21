"use client";

import { Sparkles, BrainCircuit, ArrowRight, Send, Loader2, ChevronRight, ChevronLeft } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
 
type Message = {
  id: string;
  role: "user" | "vexy";
  content: string;
};
 
export function SidebarRight() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      role: "vexy",
      content: "I'm monitoring the network. How can I assist you with your research or data auditing today?",
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
 
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
 
  useEffect(() => {
    if (!isCollapsed) {
      scrollToBottom();
    }
  }, [messages, isTyping, isCollapsed]);
 
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
 
    const userMessage: Message = { id: Date.now().toString(), role: "user", content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsTyping(true);
 
    // Simulate AI response based on the "Adaptive mix" rule
    setTimeout(() => {
      const responses = [
        "Analyzing the dataset hashes... The variance correlates strongly with the provided temperature logs. I recommend a peer-review before proceeding to the IP Tokenization phase.",
        "That's an interesting approach to the Biefeld-Brown effect. I've cross-referenced your hypothesis with 142 recent papers. Want me to generate a summary?",
        "Don't worry, I'll keep an eye on the EM Drive vacuum test data stream. If the thrust exceeds the 0.05 mN threshold, I'll alert you immediately.",
        "As your auditor, I must warn you: the seismic noise in the gravimeter readings is too high for a definitive conclusion. You should launch a Mission for Citizen Explorers to filter this data.",
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      setMessages(prev => [...prev, { id: Date.now().toString(), role: "vexy", content: randomResponse }]);
      setIsTyping(false);
    }, 2000);
  };
 
  const handleTopicClick = (topic: string) => {
    setInputValue(`Tell me about ${topic}`);
  };
 
  return (
    <aside className={`${isCollapsed ? "w-16" : "w-[320px]"} shrink-0 border-l border-gray-200 bg-white flex flex-col h-full z-10 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] transition-all duration-300 overflow-hidden`}>
      {isCollapsed ? (
        <div className="flex flex-col items-center py-6 gap-6 h-full bg-white flex-none w-16">
          <button 
            onClick={() => setIsCollapsed(false)} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-lg"
            title="Expand Sidebar"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          <div 
            onClick={() => setIsCollapsed(false)} 
            className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center relative cursor-pointer hover:scale-105 transition-transform shadow-sm"
            title="Expand Vexy AI"
          >
            <BrainCircuit className="w-5 h-5" />
            <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse" />
          </div>
          
          <div className="flex-1 flex items-center justify-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-green-600 rotate-90 whitespace-nowrap select-none">
              Vexy AI Auditor
            </span>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between p-6 border-b border-gray-100 flex-none bg-white">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center relative">
                <BrainCircuit className="w-5 h-5" />
                <div className="absolute top-0 right-0 w-2 h-2 bg-green-500 rounded-full border border-white animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 leading-tight">Vexy AI</h3>
                <p className="text-[10px] uppercase font-bold tracking-wider text-green-600 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Auditor & Concierge
                </p>
              </div>
            </div>
            <button 
              onClick={() => setIsCollapsed(true)} 
              className="text-gray-400 hover:text-gray-600 transition-colors p-1.5 hover:bg-gray-50 rounded-lg"
              title="Collapse Sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
 
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
                >
                  <div 
                    className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      msg.role === "user" 
                        ? "bg-gray-900 text-white rounded-br-none" 
                        : "bg-white border border-gray-200 text-gray-700 rounded-bl-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="flex items-start"
                >
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm flex items-center gap-2 text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-xs font-medium">Analyzing context...</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
 
          <div className="p-4 bg-white border-t border-gray-100 flex-none">
            {messages.length < 3 && (
              <div className="mb-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">Suggested</h4>
                <div className="flex flex-wrap gap-2">
                  {["Biefeld-Brown", "Audit Data", "Explain IPT"].map(topic => (
                    <button 
                      key={topic} 
                      onClick={() => handleTopicClick(topic)}
                      className="text-xs text-gray-600 bg-gray-50 border border-gray-200 rounded-full px-3 py-1.5 hover:border-gray-300 hover:bg-gray-100 transition-colors"
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>
            )}
 
            <form onSubmit={handleSubmit} className="relative">
              <input 
                type="text" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask Vexy..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-4 pr-10 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-colors"
              />
              <button 
                type="submit"
                disabled={!inputValue.trim() || isTyping}
                className="absolute right-2 top-2 p-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:hover:bg-green-500 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </>
      )}
    </aside>
  );
}
