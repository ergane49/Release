
import React from 'react';
import { Language, TranslationStyle } from '../types';
import { LANGUAGE_OPTIONS, STYLE_OPTIONS, MIXED_LANGUAGE_NOTE } from '../constants';
import { ArrowRightLeft, Settings2, HelpCircle, Info } from 'lucide-react';

interface LanguageControlsProps {
  sourceLang: Language;
  targetLang: Language;
  style: TranslationStyle;
  setSourceLang: (lang: Language) => void;
  setTargetLang: (lang: Language) => void;
  setStyle: (style: TranslationStyle) => void;
  swapLanguages: () => void;
}

const LanguageControls: React.FC<LanguageControlsProps> = ({
  sourceLang,
  targetLang,
  style,
  setSourceLang,
  setTargetLang,
  setStyle,
  swapLanguages
}) => {
  const currentStyleOption = STYLE_OPTIONS.find(opt => opt.value === style);

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        
        {/* Source Language */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">출발 언어 (From)</label>
          <select
            value={sourceLang}
            onChange={(e) => setSourceLang(e.target.value as Language)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
          >
            {LANGUAGE_OPTIONS.map((opt) => (
              <option key={`source-${opt.value}`} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Swap & Target */}
        <div className="flex items-center gap-2 self-end md:self-auto mt-6 md:mt-0">
           <button 
              onClick={swapLanguages}
              className="hidden md:flex p-2 mt-6 rounded-full hover:bg-slate-100 text-slate-400 hover:text-indigo-600 transition-colors"
              title="언어 교환"
            >
              <ArrowRightLeft size={20} />
            </button>

            <div className="flex-1 flex flex-col gap-1.5 w-full">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">도착 언어 (To)</label>
              <select
                value={targetLang}
                onChange={(e) => setTargetLang(e.target.value as Language)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
              >
                {LANGUAGE_OPTIONS.filter(opt => !opt.isSourceOnly).map((opt) => (
                  <option key={`target-${opt.value}`} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
        </div>

        {/* Style Selector */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-1 relative">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1">
              <Settings2 size={12} /> 번역 스타일
            </label>
            
            {/* Tooltip Container */}
            <div className="group relative flex items-center z-50">
              <button className="text-slate-400 hover:text-indigo-500 transition-colors focus:outline-none p-0.5">
                <HelpCircle size={14} />
              </button>
              
              {/* Tooltip Content - Positioned BELOW the icon to prevent top cropping */}
              <div className="absolute top-full left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 mt-3 w-80 md:w-96 p-5 bg-white text-slate-700 text-xs rounded-xl shadow-2xl border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-[100]">
                
                {/* Header */}
                <div className="font-bold text-indigo-600 mb-3 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Info size={16} />
                  {currentStyleOption?.label}
                </div>
                
                {/* Body Text */}
                <div className="whitespace-pre-wrap leading-relaxed mb-4 text-slate-600">
                  {currentStyleOption?.detailedDescription}
                </div>
                
                {/* Mixed Language Note */}
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-slate-500 leading-normal">
                  <span className="font-semibold text-slate-600 mr-1">[참고]</span> 
                  {MIXED_LANGUAGE_NOTE.replace('[참고] ', '')}
                </div>

                {/* Tooltip Arrow (Pointing Up) */}
                <div className="absolute bottom-full left-1/2 md:left-3.5 -translate-x-1/2 -mb-[1px] border-8 border-transparent border-b-white drop-shadow-sm"></div>
                {/* Border fix for arrow */}
                <div className="absolute bottom-full left-1/2 md:left-3.5 -translate-x-1/2 mb-[0px] border-8 border-transparent border-b-slate-200 -z-10"></div>
              </div>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg relative z-0">
            {STYLE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStyle(opt.value)}
                className={`flex-1 py-2 px-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  style === opt.value
                    ? 'bg-white text-indigo-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {opt.label.split(' ')[1]} 
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LanguageControls;
