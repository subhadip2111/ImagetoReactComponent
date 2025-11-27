import React, { useState, useCallback } from 'react';
import { LogStream } from './components/Sidebar/LogStream';
import { LivePreview } from './components/Preview/LivePreview';
import { ChatInterface } from './components/Chat/ChatInterface';
import { ReferenceImage } from './components/Preview/ReferenceImage';
import { LogEntry } from './types';
import { streamComponentGeneration } from './services/geminiService';
import { Content } from '@google/genai';

const App: React.FC = () => {
  // State
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [code, setCode] = useState<string>('');
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatHistory, setChatHistory] = useState<Content[]>([]);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-3-pro-preview');
  
  // Helper to add logs safely
  const addLog = useCallback((message: string, type: LogEntry['type'] = 'info') => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date(),
      message,
      type
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setImage(base64);
        addLog(`Image uploaded: ${file.name}`, 'info');
        
        // Auto-trigger generation if it's the first upload and we don't have code yet
        if (!code) {
           handleSendMessage("Generate a pixel-perfect React component based on this design.", base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const cleanBase64 = (dataUrl: string) => {
      return dataUrl.split(',')[1];
  }

  const handleSendMessage = async (text: string, newImage?: string) => {
    if (isProcessing) return;

    setIsProcessing(true);
    const activeImage = newImage || image;
    
    addLog(`Request: ${text}`, 'info');

    // Only clear code if we are starting a completely new design from an image
    if (newImage) setCode('');

    let currentStreamCode = '';
    let accumulatedText = '';

    try {
        const imagePayload = activeImage ? cleanBase64(activeImage) : undefined;
        
        // Pass the selected model to the service
        const stream = streamComponentGeneration(text, selectedModel, imagePayload, chatHistory);

        for await (const chunk of stream) {
            accumulatedText += chunk;
            
            // Robust parsing for code blocks
            // Matches ```tsx ... ``` or ```typescript ... ``` or ```jsx ... ```
            // We enforce the language tag to avoid picking up random markdown blocks
            const codeBlockRegex = /```(?:tsx|typescript|jsx)\s*([\s\S]*?)(?:```|$)/i;
            const match = codeBlockRegex.exec(accumulatedText);
            
            if (match && match[1]) {
                const codeContent = match[1].trim();
                if (codeContent) {
                    if (!currentStreamCode) {
                        addLog("Writing code...", 'code');
                    }
                    currentStreamCode = codeContent;
                    setCode(currentStreamCode);
                }
            } else {
                // If we are not in a code block yet, we might want to show some logs?
                // The issue is distinguishing "thinking" from "partial code block not yet started"
                // For now, we rely on the final logs to show the full picture, 
                // but real-time logs could be extracted if the model prefixes them.
            }
        }
        
        addLog("Generation complete.", 'success');
        
        const userContent: Content = { role: 'user', parts: [{ text }]};
        const modelContent: Content = { role: 'model', parts: [{ text: accumulatedText }]};
        
        setChatHistory(prev => [...prev, userContent, modelContent]);

    } catch (error: any) {
        addLog(`Error: ${error.message}`, 'error');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-black overflow-hidden font-sans">
      {/* LEFT COLUMN: AI LOGS */}
      <div className="w-[350px] flex-shrink-0 h-full">
        <LogStream 
            logs={logs} 
            isProcessing={isProcessing} 
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
        />
      </div>

      {/* RIGHT COLUMN: WORKSPACE */}
      <div className="flex-1 flex flex-col h-full border-l border-gray-800">
        
        {/* TOP: LIVE PREVIEW (60%) */}
        <div className="h-[60%] w-full relative">
            <LivePreview code={code} />
        </div>

        {/* BOTTOM: SPLIT (IMAGE & CHAT) (40%) */}
        <div className="h-[40%] flex border-t border-gray-800">
            {/* REFERENCE IMAGE */}
            <div className="w-1/2 h-full">
                <ReferenceImage 
                    image={image} 
                    onClear={() => setImage(null)} 
                />
            </div>

            {/* CHAT INTERFACE */}
            <div className="w-1/2 h-full">
                <ChatInterface 
                    onSendMessage={(msg) => handleSendMessage(msg)}
                    uploadedImage={image}
                    onImageUpload={handleImageUpload}
                    onClearImage={() => setImage(null)}
                    isProcessing={isProcessing}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;