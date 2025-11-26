import React, { useEffect, useState } from 'react';
import { RefreshCcw, Monitor, Code, Check, Eye } from 'lucide-react';

interface LivePreviewProps {
  code: string;
}

export const LivePreview: React.FC<LivePreviewProps> = ({ code }) => {
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!code) {
        setIframeSrc('');
        return;
    }

    try {
      // 1. Remove markdown fences
      let cleanCode = code.replace(/```tsx/g, '').replace(/```typescript/g, '').replace(/```jsx/g, '').replace(/```/g, '');
      
      // 2. Remove imports (aggressive multiline support)
      // Matches "import ... from '...';" handling newlines and various formats
      cleanCode = cleanCode.replace(/import\s+([\s\S]*?)\s+from\s+['"][^'"]+['"];?/g, '');
      
      // 3. Transform "export default" to a known variable assignment so we can render it
      // Case A: export default function Name() {}
      if (/export\s+default\s+function\s+\w+/.test(cleanCode)) {
         cleanCode = cleanCode.replace(/export\s+default\s+function\s+(\w+)/, 'const GeneratedComponent = function $1');
      } 
      // Case B: export default function() {}
      else if (/export\s+default\s+function\s*\(/.test(cleanCode)) {
         cleanCode = cleanCode.replace(/export\s+default\s+function\s*\(/, 'const GeneratedComponent = function(');
      }
      // Case C: export default () => {}
      else if (/export\s+default\s+\(/.test(cleanCode)) {
         cleanCode = cleanCode.replace(/export\s+default\s+\(/, 'const GeneratedComponent = (');
      }
      // Case D: export default MyComponent; (at the end)
      else if (/export\s+default\s+[\w\d_]+;?/.test(cleanCode)) {
         cleanCode = cleanCode.replace(/export\s+default\s+([\w\d_]+);?/, 'const GeneratedComponent = $1;');
      }

      // 4. Strip TS interfaces if needed, though Babel Standalone handles TS usually.
      // We will rely on Babel for TS stripping.

      const html = `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <script src="https://cdn.tailwindcss.com"></script>
            <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
            <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
            <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
            <script src="https://unpkg.com/lucide@latest"></script>
            <script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.min.js"></script>
            <style>
                body { background-color: #0d1117; color: white; margin: 0; min-height: 100vh; overflow-x: hidden; font-family: 'Inter', sans-serif; }
                #root { min-height: 100vh; }
                ::-webkit-scrollbar { width: 8px; }
                ::-webkit-scrollbar-track { background: #0d1117; }
                ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
                .error { color: #ff6b6b; padding: 20px; font-family: monospace; white-space: pre-wrap; background: rgba(255,0,0,0.1); }
            </style>
          </head>
          <body>
            <div id="root"></div>
            <script type="text/babel" data-presets="react,env,typescript">
              // Setup environment
              const { useState, useEffect, useRef, useMemo, useCallback } = React;
              
              // Expose Lucide icons globally to window so they are available without imports
              // We check both the UMD global and the potential direct script exposure
              if (typeof window.lucideReact !== 'undefined') {
                Object.assign(window, window.lucideReact);
              } else if (typeof window.lucide !== 'undefined') {
                Object.assign(window, window.lucide);
              }

              // Error boundary for rendering
              class ErrorBoundary extends React.Component {
                constructor(props) {
                  super(props);
                  this.state = { hasError: false, error: null };
                }
                static getDerivedStateFromError(error) {
                  return { hasError: true, error };
                }
                componentDidCatch(error, errorInfo) {
                  console.error("Preview Error:", error, errorInfo);
                }
                render() {
                  if (this.state.hasError) {
                    return (
                        <div className="error">
                            <h3>Runtime Error</h3>
                            <p>{this.state.error.toString()}</p>
                        </div>
                    );
                  }
                  return this.props.children;
                }
              }

              try {
                // User Generated Code
                ${cleanCode}

                // Render
                const root = ReactDOM.createRoot(document.getElementById('root'));
                
                // Determine what to render
                let ComponentToRender = null;
                
                if (typeof GeneratedComponent !== 'undefined') {
                    ComponentToRender = GeneratedComponent;
                } else {
                    // Fallback: Check for a variable named 'App' or 'Component'
                     if (typeof App !== 'undefined') ComponentToRender = App;
                     else if (typeof Component !== 'undefined') ComponentToRender = Component;
                }

                if (ComponentToRender) {
                   root.render(
                     <ErrorBoundary>
                       <ComponentToRender />
                     </ErrorBoundary>
                   );
                } else {
                   throw new Error("Could not find a component to render. Please ensuring you 'export default' your component.");
                }

              } catch (err) {
                document.body.innerHTML = '<div class="error"><h3>Compile/Setup Error</h3><p>' + err.message + '</p></div>';
                console.error(err);
              }
            </script>
          </body>
        </html>
      `;

      setIframeSrc(html);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    }
  }, [code]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      <div className="h-10 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4 select-none">
         <div className="flex items-center gap-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                <Monitor size={14} /> Result
            </span>
            <div className="flex bg-gray-900 rounded-lg p-0.5 border border-gray-700">
                <button 
                    onClick={() => setActiveTab('preview')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${activeTab === 'preview' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    <Eye size={12} /> Preview
                </button>
                <button 
                    onClick={() => setActiveTab('code')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-medium transition-colors ${activeTab === 'code' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400 hover:text-gray-300'}`}
                >
                    <Code size={12} /> Code
                </button>
            </div>
         </div>
         <div className="flex items-center gap-2">
            {activeTab === 'code' && (
                <button 
                    onClick={copyCode}
                    className="flex items-center gap-1.5 px-2 py-1 text-xs text-gray-400 hover:text-white transition-colors"
                >
                    {copySuccess ? <Check size={12} className="text-green-500" /> : <RefreshCcw size={12} className="rotate-0" />}
                    {copySuccess ? 'Copied' : 'Copy'}
                </button>
            )}
         </div>
      </div>
      
      <div className="flex-1 relative bg-black/50 overflow-hidden">
        {activeTab === 'preview' ? (
            <>
                {code ? (
                    <iframe 
                    title="Preview"
                    srcDoc={iframeSrc}
                    className="w-full h-full border-none"
                    sandbox="allow-scripts allow-same-origin"
                />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 flex-col gap-2">
                        <RefreshCcw size={32} className="animate-spin-slow opacity-20" />
                        <p className="text-sm">Waiting for generation...</p>
                    </div>
                )}
                
                {error && (
                    <div className="absolute bottom-4 right-4 bg-red-900/90 text-red-200 p-4 rounded-lg shadow-xl border border-red-700 max-w-md text-sm">
                        <strong>Preview Error:</strong> {error}
                    </div>
                )}
            </>
        ) : (
            <div className="w-full h-full overflow-auto bg-gray-950 p-4">
                <pre className="font-mono text-xs text-gray-300 whitespace-pre-wrap">
                    <code>{code || '// Code will appear here...'}</code>
                </pre>
            </div>
        )}
      </div>
    </div>
  );
};