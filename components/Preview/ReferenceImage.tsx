import React from 'react';
import { Image as ImageIcon, X } from 'lucide-react';

interface ReferenceImageProps {
  image: string | null;
  onClear: () => void;
}

export const ReferenceImage: React.FC<ReferenceImageProps> = ({ image, onClear }) => {
  if (!image) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center bg-gray-900 border-r border-gray-800 text-gray-600 p-6 text-center border-t border-gray-800">
        <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center mb-4">
            <ImageIcon size={32} className="opacity-50" />
        </div>
        <h3 className="text-sm font-medium text-gray-400">No Reference Image</h3>
        <p className="text-xs mt-2 text-gray-600 max-w-[200px]">
          Upload a Figma screenshot or any UI design to start the generation process.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full bg-gray-900 border-r border-gray-800 relative group border-t border-gray-800 flex flex-col">
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button 
          onClick={onClear}
          className="bg-black/70 text-white p-1.5 rounded-full hover:bg-red-500/80 transition-colors"
        >
          <X size={14} />
        </button>
      </div>
      <div className="p-2 bg-gray-800/50 text-xs text-gray-400 border-b border-gray-700">
         Reference Design
      </div>
      <div className="flex-1 overflow-hidden flex items-center justify-center bg-black/20 p-2">
        <img 
            src={image} 
            alt="Reference" 
            className="max-w-full max-h-full object-contain rounded-md shadow-lg border border-gray-800" 
        />
      </div>
    </div>
  );
};
