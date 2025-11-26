import React, { useState, useRef } from 'react';
import { Send, Image as ImageIcon, X } from 'lucide-react';

interface ChatInterfaceProps {
  onSendMessage: (message: string, image?: string) => void;
  uploadedImage: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  isProcessing: boolean;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  onSendMessage, 
  uploadedImage, 
  onImageUpload,
  onClearImage,
  isProcessing 
}) => {
  const [input, setInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((input.trim() || uploadedImage) && !isProcessing) {
      // Logic handled in parent, we just pass the intention
      // But here we need to know if this is a "new" upload or the persistent one.
      // For this specific UI requirement, the persistent image is displayed separately.
      // This input handles *new* prompts. 
      onSendMessage(input);
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit(e);
    }
  }

  return (
    <div className="flex flex-col h-full bg-gray-900 border-t border-gray-800">
      <div className="p-2 bg-gray-800/50 text-xs text-gray-400 border-b border-gray-700 flex justify-between">
         <span>Refinement Chat</span>
         <span>Gemini 3 Pro</span>
      </div>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col p-4 gap-4">
        <div className="flex-1 relative">
            <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={uploadedImage ? "Ask for changes (e.g., 'Make the button blue', 'Add more padding')..." : "Describe the UI you want to build or upload an image..."}
            className="w-full h-full bg-gray-950 border border-gray-700 rounded-lg p-3 text-gray-200 placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none text-sm font-sans"
            disabled={isProcessing}
            />
            
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
                 <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    accept="image/*"
                    onChange={onImageUpload}
                 />
                 <button 
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-full transition-colors"
                    title="Upload Design Image"
                    disabled={isProcessing}
                 >
                    <ImageIcon size={18} />
                 </button>
                 <button 
                    type="submit" 
                    disabled={!input.trim() && !uploadedImage || isProcessing}
                    className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-900/20"
                 >
                    <Send size={18} />
                 </button>
            </div>
        </div>
      </form>
    </div>
  );
};
