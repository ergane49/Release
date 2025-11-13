
import React, { useState } from 'react';
import { Copy, Check, Loader2, Square } from 'lucide-react';
import { Language, LoadingState } from '../types';

interface ResultCardProps {
  translatedText: string;
  loadingState: LoadingState;
  onStopTranslation?: () => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  translatedText,
  loadingState,
  onStopTranslation
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!translatedText && loadingState === 'idle') {
    return null;
  }

  return (
    <div className="h-full">
      {/* Translated Text Only */}
      <div className="flex flex-col h-full relative group">
        <div className="bg-indigo-50 text-indigo-600 text-xs font-bold px-4 py-2 rounded-t-xl uppercase tracking-wider border-b border-indigo-100 flex justify-between items-center">
          <span>번역 결과 (Result)</span>
          {loadingState === 'translating' && (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-indigo-400">
                <Loader2 size={12} className="animate-spin" /> 번역 중...
              </span>
              {onStopTranslation && (
                <button 
                  onClick={onStopTranslation} 
                  className="text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-2 py-0.5 rounded transition-colors flex items-center gap-1"
                >
                  <Square size={10} className="fill-current" /> 중지
                </button>
              )}
            </div>
          )}
        </div>
        
        {/* Font size adjusted to text-sm (approx 1pt smaller than text-base) */}
        <div className="flex-1 bg-white p-4 pb-12 rounded-b-xl border border-indigo-100 text-slate-900 text-sm leading-relaxed shadow-sm min-h-[200px] whitespace-pre-wrap">
          {loadingState === 'translating' ? (
             <div className="space-y-2 animate-pulse">
               <div className="h-4 bg-slate-200 rounded w-3/4"></div>
               <div className="h-4 bg-slate-200 rounded w-1/2"></div>
               <div className="h-4 bg-slate-200 rounded w-5/6"></div>
             </div>
          ) : (
            translatedText || <span className="text-slate-300 italic">결과가 여기에 표시됩니다...</span>
          )}
        </div>

        {/* Actions - Copy Only (TTS Removed) */}
        {translatedText && loadingState === 'idle' && (
          <div className="absolute bottom-3 right-3 flex items-center gap-2 transition-opacity opacity-100">
            <button 
              onClick={handleCopy}
              className="p-2 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
              title="복사"
            >
              {copied ? <Check size={18} className="text-green-600"/> : <Copy size={18} />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultCard;
