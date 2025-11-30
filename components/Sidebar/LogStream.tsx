import React, { useEffect, useRef } from 'react';
import { Terminal, Cpu, CheckCircle, Code2, Settings } from 'lucide-react';
import { LogEntry } from '../../types';

interface LogStreamProps {
  logs: LogEntry[];
  isProcessing: boolean;
  selectedModel: string;
  apiKey: string,
  onApiKeyChange: (key: string) => void;
  onSelectModel: (model: string) => void;
}

export const LogStream: React.FC<LogStreamProps> = ({ logs, isProcessing, selectedModel, onSelectModel, apiKey, onApiKeyChange }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-gray-950 border-r border-gray-800 font-mono text-sm">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-gray-100 font-semibold flex items-center gap-2">
            <Terminal size={18} className="text-blue-400" />
            AI Logs
          </h2>
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/20">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></div>
            <span className="text-[10px] text-blue-300 font-medium uppercase tracking-wider">Live</span>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Model Engine</label>
          <div className="relative">
            <select
              value={selectedModel}
              onChange={(e) => onSelectModel(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded p-2 pr-8 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none appearance-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="gemini-3-pro-preview">Gemini 3.0 Pro (Most Capable/Preview)</option>
              <option value="gemini-2.5-pro">Gemini 2.5 Pro (Powerful, Complex Reasoning)</option>

              <option value="gemini-2.5-flash" selected>Gemini 2.5 Flash (Balanced Speed & Intelligence)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash (Reliable Multimodal Workhorse)</option>

              <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash-Lite (Fastest, Lowest Latency)</option>

              <option value="gemini-2.5-flash-image">Gemini 2.5 Flash Image (Image Generation/Editing)</option>

            </select>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <Settings size={12} />
            </div>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold">Add your api keys</label>
          <div className="relative">
            <input
              type="password"
              placeholder="Enter your Gemini API key"
              value={apiKey}
              onChange={(e) => onApiKeyChange(e.target.value)}
              disabled={isProcessing}
              className="w-full bg-gray-900 hover:bg-gray-800 border border-gray-700 text-gray-300 text-xs rounded p-2 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
              <Settings size={12} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {logs.length === 0 && !isProcessing && (
          <div className="text-gray-600 italic text-center mt-10">
            Waiting for input...
          </div>
        )}

        {logs.map((log) => (
          <div key={log.id} className="animate-fade-in flex gap-3 group">
            <div className="mt-1 flex-shrink-0">
              {log.type === 'info' && <Cpu size={14} className="text-blue-500/80" />}
              {log.type === 'code' && <Code2 size={14} className="text-purple-500/80" />}
              {log.type === 'success' && <CheckCircle size={14} className="text-green-500/80" />}
            </div>
            <div className="flex-1">
              <span className="text-xs text-gray-600 block mb-0.5">
                {log.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
              <p className={`leading-relaxed whitespace-pre-wrap ${log.type === 'code' ? 'text-purple-300' : 'text-gray-300'
                }`}>
                {log.message}
              </p>
            </div>
          </div>
        ))}

        {isProcessing && (
          <div className="flex items-center gap-2 text-blue-400 p-2 animate-pulse">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-75" />
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150" />
            <span className="text-xs uppercase tracking-wider ml-2">Processing</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};