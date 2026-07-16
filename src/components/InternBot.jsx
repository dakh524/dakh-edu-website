import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, MessageSquare, ExternalLink, Sparkles, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

const MAIN_MENU_OPTIONS = [
  "Check Registration Status",
  "Download Certificate",
  "Internship FAQs",
  "Talk to human on Telegram"
];

const INITIAL_MESSAGES = [
  {
    id: 1,
    type: 'bot',
    text: "Hi there! 👋 I'm the DAKH Intern Bot. How can I help you with your internship journey today?",
    options: MAIN_MENU_OPTIONS
  }
];

const InternBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const [botState, setBotState] = useState('IDLE'); // IDLE, AWAITING_REG_EMAIL, AWAITING_CERT_EMAIL, AWAITING_CERT_CODE, TYPING
  const [tempData, setTempData] = useState({});
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen, botState]);

  const addBotMessage = (text, options = null) => {
    setMessages(prev => [...prev, { id: Date.now(), type: 'bot', text, options }]);
    setBotState('IDLE');
  };

  const handleRegistrationCheck = async (email) => {
    setBotState('TYPING');
    try {
      const { data, error } = await supabase
        .from('registrations')
        .select('*')
        .ilike('email', email)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        addBotMessage("I couldn't find any registration with that email. Please check your email or contact support.", MAIN_MENU_OPTIONS);
      } else {
        addBotMessage(`Here is your status, ${data.full_name}:\n\nStatus: ${data.status}\nPayment Completed: ${data.payment_completed ? 'Yes' : 'No'}\nIntern Number: ${data.intern_number || 'Not assigned yet'}\nDomain: ${data.domain}`, MAIN_MENU_OPTIONS);
      }
    } catch (err) {
      addBotMessage("Sorry, I encountered an error checking your status.", MAIN_MENU_OPTIONS);
    }
  };

  const handleCertificateCheck = async (email, code) => {
    setBotState('TYPING');
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .ilike('email', email)
        .eq('certificate_code', code)
        .single();

      if (error || !data) {
        addBotMessage("Sorry, I couldn't find a certificate matching that email and code. Please verify your details.", MAIN_MENU_OPTIONS);
      } else {
        const certUrl = `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/badges/${data.domain.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-badge.png`;
        addBotMessage(`Certificate found for ${data.full_name}!\nDomain: ${data.domain}\nCode: ${data.certificate_code}\n\nYou can download or view your badge below.`, ["View Badge", ...MAIN_MENU_OPTIONS]);
        setTempData({ certUrl });
      }
    } catch (err) {
      addBotMessage("Sorry, I encountered an error fetching your certificate.", MAIN_MENU_OPTIONS);
    }
  };

  const handleOptionClick = (option) => {
    if (option === "View Badge" && tempData.certUrl) {
      window.open(tempData.certUrl, '_blank');
      return;
    }
    handleUserMessage(option);
  };

  const handleUserMessage = async (text) => {
    if (!text.trim()) return;

    const userText = text.trim();
    setMessages(prev => [...prev, { id: Date.now(), type: 'user', text: userText }]);
    setInputText('');

    if (userText === "Talk to human on Telegram") {
      window.open('https://t.me/DAKH_Edu_Bot', '_blank');
      addBotMessage("Opening Telegram for human support...", MAIN_MENU_OPTIONS);
      return;
    }

    if (userText === "Internship FAQs") {
      addBotMessage("We offer internships in multiple domains (Web Dev, AI, Cyber Security, etc.) in Online, Offline, and Hybrid modes. Please check the top of this page for full details!", MAIN_MENU_OPTIONS);
      return;
    }

    if (userText === "Check Registration Status") {
      setBotState('AWAITING_REG_EMAIL');
      setMessages(prev => [...prev, { id: Date.now()+1, type: 'bot', text: "Please enter your registered email address to check your status:" }]);
      return;
    }

    if (userText === "Download Certificate") {
      setBotState('AWAITING_CERT_EMAIL');
      setMessages(prev => [...prev, { id: Date.now()+1, type: 'bot', text: "Please enter your registered email address for the certificate:" }]);
      return;
    }

    // Handle State Machine
    if (botState === 'AWAITING_REG_EMAIL') {
      await handleRegistrationCheck(userText);
      return;
    }

    if (botState === 'AWAITING_CERT_EMAIL') {
      setTempData({ ...tempData, certEmail: userText });
      setBotState('AWAITING_CERT_CODE');
      setMessages(prev => [...prev, { id: Date.now()+1, type: 'bot', text: "Great. Now please enter your Certificate Code (e.g. DES/INT/2026/001):" }]);
      return;
    }

    if (botState === 'AWAITING_CERT_CODE') {
      await handleCertificateCheck(tempData.certEmail, userText);
      return;
    }

    // Default Fallback
    setBotState('TYPING');
    setTimeout(() => {
      addBotMessage("I'm not sure how to respond to that. Please select one of the options below.", MAIN_MENU_OPTIONS);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleUserMessage(inputText);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-24 right-6 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-purple-100 overflow-hidden z-[100] flex flex-col h-[500px]"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4 flex items-center justify-between shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-8 -mt-8 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              <div className="flex items-center gap-3 relative z-10">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-inner">
                  <Bot className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">DAKH Intern Bot</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                    <span className="text-purple-100 text-xs font-medium">Online</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-purple-100 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors relative z-10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-4">
              {messages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={msg.id}
                  className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${
                      msg.type === 'user' 
                        ? 'bg-purple-600 text-white rounded-tr-sm' 
                        : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                    }`}
                  >
                    {msg.text}
                  </div>
                  
                  {msg.options && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleOptionClick(opt)}
                          className={`text-xs px-3 py-1.5 rounded-full transition-colors font-medium flex items-center gap-1 ${opt === 'View Badge' ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'}`}
                        >
                          {opt === 'Talk to human on Telegram' ? <ExternalLink className="w-3 h-3" /> : opt === 'View Badge' ? <CheckCircle2 className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />}
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              ))}
              
              {botState === 'TYPING' && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
                   <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                     <Loader2 className="w-4 h-4 text-purple-600 animate-spin" />
                     <span className="text-xs text-gray-500 font-medium">Bot is typing...</span>
                   </div>
                </motion.div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <form onSubmit={handleSubmit} className="flex items-center gap-2 relative">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={botState === 'TYPING' ? "Please wait..." : "Type a message..."}
                  disabled={botState === 'TYPING'}
                  className="flex-1 bg-slate-100 border-none rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700 placeholder-gray-400 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || botState === 'TYPING'}
                  className="w-10 h-10 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed shrink-0 shadow-md"
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full shadow-2xl shadow-purple-500/40 flex items-center justify-center text-white z-[100] group border-2 border-white/20 cursor-pointer"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
            >
              <X className="w-6 h-6" />
            </motion.div>
          ) : (
            <motion.div
              key="bot"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              className="relative"
            >
              <MessageSquare className="w-6 h-6" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-purple-600"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </>
  );
};

export default InternBot;
