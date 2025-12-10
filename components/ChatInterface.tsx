
import React, { useState, useRef, useEffect } from 'react';
import { Message } from '../types';
import { Send, Image as ImageIcon, X, Crown } from 'lucide-react';

interface Props {
  messages: Message[];
  onSendMessage: (text: string, image?: string) => Promise<void>;
  isTyping: boolean;
  dailyCount: number;
  messageLimit: number;
}

const ChatInterface: React.FC<Props> = ({ messages, onSendMessage, isTyping, dailyCount, messageLimit }) => {
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("A imagem deve ter no máximo 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedImage) || dailyCount >= messageLimit) return;

    const text = inputText;
    const img = selectedImage;

    setInputText('');
    setSelectedImage(null);
    
    await onSendMessage(text, img || undefined);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (dailyCount >= messageLimit) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-lia-bg">
        <h2 className="text-2xl font-serif text-lia-primary mb-4">Descanso Diário</h2>
        <p className="text-lia-secondary mb-6 leading-relaxed">
          Atingimos nosso limite de trocas por hoje no seu plano atual.
          Aproveite para refletir sobre o que conversamos.
        </p>
        <button className="bg-lia-primary text-white px-6 py-3 rounded-xl shadow-md hover:bg-stone-800 transition flex items-center gap-2">
            <Crown size={16} />
            Desbloquear LIA Premium
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#E5DDD5] relative">
      {/* Background Pattern Subtle */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}></div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 z-10 no-scrollbar">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 shadow-sm relative text-sm leading-relaxed break-words ${
                msg.role === 'user'
                  ? 'bg-[#D9FDD3] text-stone-900 rounded-tr-none'
                  : 'bg-white text-stone-800 rounded-tl-none'
              }`}
            >
              {msg.image && (
                <img src={msg.image} alt="User upload" className="mb-2 rounded-md max-h-60 object-cover" />
              )}
              <p className="whitespace-pre-wrap">{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start animate-fade-in">
             <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
               <div className="flex space-x-1">
                 <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#F0F2F5] p-2 md:p-3 flex items-end gap-2 z-20">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleImageSelect}
        />
        
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-3 text-stone-500 hover:text-stone-700 transition-colors"
        >
          <ImageIcon size={24} />
        </button>

        <div className="flex-1 bg-white rounded-2xl flex flex-col px-4 py-2 shadow-sm border border-transparent focus-within:border-stone-300 transition-colors">
          {selectedImage && (
            <div className="relative w-fit mb-2">
              <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg object-cover" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-stone-700 text-white rounded-full p-1 shadow-md"
              >
                <X size={12} />
              </button>
            </div>
          )}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Digite sua mensagem..."
            className="w-full bg-transparent resize-none focus:outline-none text-stone-800 max-h-32 py-1 placeholder:text-stone-400"
            rows={1}
            style={{ minHeight: '24px' }}
          />
        </div>

        <button
          onClick={handleSend}
          disabled={!inputText.trim() && !selectedImage}
          className={`p-3 rounded-full transition-all ${
            (!inputText.trim() && !selectedImage)
              ? 'bg-stone-200 text-stone-400' 
              : 'bg-[#005C4B] text-white shadow-md hover:bg-[#004a3c]'
          }`}
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

export default ChatInterface;
