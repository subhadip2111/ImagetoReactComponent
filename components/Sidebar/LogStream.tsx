import React, { useEffect, useRef } from 'react';
import { Terminal, Cpu, CheckCircle, Code2 } from 'lucide-react';
import { LogEntry } from '../../types';

interface LogStreamProps {
  logs: LogEntry[];
  isProcessing: boolean;
}

export const LogStream: React.FC<LogStreamProps> = ({ logs, isProcessing }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full flex flex-col bg-gray-950 border-r border-gray-800 font-mono text-sm">
      <div className="p-4 border-b border-gray-800 bg-gray-900/50 backdrop-blur sticky top-0 z-10">
        <h2 className="text-gray-100 font-semibold flex items-center gap-2">
          <Terminal size={18} className="text-blue-400" />
          AI Engineering Logs
        </h2>
        <p className="text-gray-500 text-xs mt-1">
          Real-time analysis & generation process
        </p>
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
                   {log.timestamp.toLocaleTimeString([], {hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}
               </span>
               <p className={`leading-relaxed whitespace-pre-wrap ${
                   log.type === 'code' ? 'text-purple-300' : 'text-gray-300'
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
