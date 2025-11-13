
import React, { useState, useEffect, useRef } from 'react';
import { Language, TranslationStyle, AppMode, LoadingState, TranslationHistoryItem, GlossaryTerm } from './types';
import { translateText } from './services/geminiService';
import LanguageControls from './components/LanguageControls';
import ResultCard from './components/ResultCard';
import ImageUploader from './components/ImageUploader';
import GlossaryEditor from './components/GlossaryEditor';
import { History, Keyboard, Camera, Sparkles, RotateCcw } from 'lucide-react';

function App() {
  // --- State ---
  const [mode, setMode] = useState<AppMode>(AppMode.TEXT);
  const [sourceLang, setSourceLang] = useState<Language>(Language.AUTO);
  const [targetLang, setTargetLang] = useState<Language>(Language.KOREAN);
  const [style, setStyle] = useState<TranslationStyle>(TranslationStyle.LITERAL);
  
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [loadingState, setLoadingState] = useState<LoadingState>('idle');
  
  const [history, setHistory] = useState<TranslationHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Glossary State
  const [glossaryTerms, setGlossaryTerms] = useState<GlossaryTerm[]>([
    { id: '1', source: '', target: '' },
    { id: '2', source: '', target: '' },
    { id: '3', source: '', target: '' }
  ]);
  const [showGlossary, setShowGlossary] = useState(false);

  // Refs for cancellation
  const abortFlagRef = useRef(false);

  // --- Effects ---

  // Load History
  useEffect(() => {
    const saved = localStorage.getItem('맞춤형 텍스트 번역기History');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  // Save History
  const saveToHistory = (original: string, translated: string) => {
    if (!original || !translated) return;
    
    const newItem: TranslationHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      sourceLang,
      targetLang,
      originalText: original,
      translatedText: translated,
      style
    };

    const newHistory = [newItem, ...history].slice(0, 50); // Keep last 50
    setHistory(newHistory);
    localStorage.setItem('맞춤형 텍스트 번역기History', JSON.stringify(newHistory));
  };

  // Debounced Translation for Text Mode
  useEffect(() => {
    if (mode === AppMode.IMAGE) return; // Manual trigger for image mode

    // Cancel previous pending translation if any (logical cancellation)
    abortFlagRef.current = true;

    const timer = setTimeout(async () => {
      if (inputText.trim()) {
        setLoadingState('translating');
        abortFlagRef.current = false; // Reset flag for new request
        
        try {
          const result = await translateText(inputText, sourceLang, targetLang, style, glossaryTerms);
          
          // Check if cancelled
          if (!abortFlagRef.current) {
            setTranslatedText(result);
          }
        } catch (e) {
          if (!abortFlagRef.current) {
            setTranslatedText("번역 중 오류가 발생했습니다.");
          }
        } finally {
          if (!abortFlagRef.current) {
            setLoadingState('idle');
          }
        }
      } else {
        setTranslatedText('');
      }
    }, 800); // 800ms debounce

    return () => {
      clearTimeout(timer);
      abortFlagRef.current = true; // Cancel on unmount or effect re-run
    };
  }, [inputText, sourceLang, targetLang, style, mode]); 
  // Removed glossaryTerms from dependency to prevent auto-translate on typing in glossary

  // --- Handlers ---

  const handleSwapLanguages = () => {
    if (sourceLang === Language.AUTO) return; // Can't swap auto
    setSourceLang(targetLang);
    setTargetLang(sourceLang);
    setInputText(translatedText); // Swap text too
    setTranslatedText(inputText);
  };

  const handleManualTranslation = async () => {
    if (!inputText.trim()) return;
    
    setLoadingState('translating');
    abortFlagRef.current = false;
    
    try {
      const result = await translateText(inputText, sourceLang, targetLang, style, glossaryTerms);
      if (!abortFlagRef.current) {
        setTranslatedText(result);
      }
    } catch (e) {
      if (!abortFlagRef.current) {
        setTranslatedText("번역 중 오류가 발생했습니다.");
      }
    } finally {
      if (!abortFlagRef.current) {
        setLoadingState('idle');
      }
    }
  };

  const handleImageTextExtracted = async (text: string) => {
    setInputText(text);
    setMode(AppMode.TEXT); // Switch to text mode to show result
    
    // Trigger translation immediately
    setLoadingState('translating');
    abortFlagRef.current = false;
    try {
      const result = await translateText(text, sourceLang, targetLang, style, glossaryTerms);
      if (!abortFlagRef.current) {
        setTranslatedText(result);
        saveToHistory(text, result);
      }
    } catch (e) {
      if (!abortFlagRef.current) {
        setTranslatedText("번역 중 오류가 발생했습니다.");
      }
    } finally {
      if (!abortFlagRef.current) {
        setLoadingState('idle');
      }
    }
  };

  const handleStopTranslation = () => {
    abortFlagRef.current = true;
    setLoadingState('idle');
  };

  const handleReset = () => {
    setInputText('');
    // translatedText will be cleared by the useEffect when inputText becomes empty
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="fill-indigo-600" size={24} />
            <h1 className="font-bold text-xl tracking-tight text-slate-900">맞춤형 텍스트 번역기</h1>
          </div>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition-colors"
            title="번역 기록"
          >
            <History size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-6">
        
        {/* Mode Switcher */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm border border-slate-200 inline-flex">
            <button
              onClick={() => setMode(AppMode.TEXT)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === AppMode.TEXT 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Keyboard size={16} /> 텍스트 입력
            </button>
            <button
              onClick={() => setMode(AppMode.IMAGE)}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === AppMode.IMAGE 
                  ? 'bg-indigo-600 text-white shadow-md' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Camera size={16} /> 이미지 (OCR)
            </button>
          </div>
        </div>

        {/* Global Controls */}
        <LanguageControls 
          sourceLang={sourceLang}
          targetLang={targetLang}
          style={style}
          setSourceLang={setSourceLang}
          setTargetLang={setTargetLang}
          setStyle={setStyle}
          swapLanguages={handleSwapLanguages}
        />

        {/* Glossary */}
        <GlossaryEditor 
          terms={glossaryTerms}
          setTerms={setGlossaryTerms}
          isVisible={showGlossary}
          toggleVisibility={() => setShowGlossary(!showGlossary)}
          onRetranslate={handleManualTranslation}
        />

        {/* Content Area */}
        <div className="grid grid-cols-1 gap-6">
          
          {/* Image Upload Section */}
          {mode === AppMode.IMAGE && (
            <ImageUploader 
              onTextExtracted={handleImageTextExtracted} 
              setLoading={(isLoading) => setLoadingState(isLoading ? 'extracting_text' : 'idle')}
            />
          )}

          {/* Text Input (Visible in Text Mode) */}
          {mode === AppMode.TEXT && (
            <div className="flex flex-col rounded-xl shadow-sm border border-slate-200 bg-white overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex justify-between items-center">
                <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">원본 텍스트 (Original)</span>
                <div className="flex items-center gap-3">
                  {inputText && (
                    <button 
                      onClick={handleReset}
                      className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-600 px-2 py-1 rounded transition-colors flex items-center gap-1"
                    >
                      <RotateCcw size={12} /> 새로 입력
                    </button>
                  )}
                  <span className="text-xs text-slate-400 min-w-[3rem] text-right">{inputText.length} 자</span>
                </div>
              </div>
              
              {/* Text Area */}
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="번역할 텍스트를 입력하세요..."
                className="w-full h-40 p-4 border-none resize-none focus:ring-0 text-sm text-slate-700 placeholder-slate-300 bg-transparent leading-relaxed"
                spellCheck={false}
              />

              {/* Disclaimer */}
              <div className="px-4 pb-4">
                <p className="text-xs text-slate-500">
                  * 원문에서 문단이 잘려도, 실제 번역 시에는 한 개의 문장으로 자동 수정하여 번역합니다.
                </p>
              </div>
            </div>
          )}

          {/* Results (Always visible if there is data) */}
          {(inputText || translatedText) && (
             <div className="h-auto min-h-[300px]">
               <ResultCard 
                 translatedText={translatedText}
                 loadingState={loadingState}
                 onStopTranslation={handleStopTranslation}
               />
             </div>
          )}

        </div>
      </main>

      {/* History Sidebar (Overlay) */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setShowHistory(false)}></div>
          <div className="relative bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-slide-in-right">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                <History size={20} /> 번역 기록
              </h2>
              <button onClick={() => setShowHistory(false)} className="text-slate-400 hover:text-slate-600">닫기</button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {history.length === 0 && (
                <p className="text-center text-slate-400 mt-10">기록이 없습니다.</p>
              )}
              {history.map((item) => (
                <div 
                  key={item.id} 
                  className="p-4 rounded-lg border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors cursor-pointer group"
                  onClick={() => {
                    setSourceLang(item.sourceLang);
                    setTargetLang(item.targetLang);
                    setStyle(item.style);
                    setInputText(item.originalText);
                    setTranslatedText(item.translatedText);
                    setMode(AppMode.TEXT);
                    setShowHistory(false);
                  }}
                >
                  <div className="flex justify-between text-xs text-slate-500 mb-2">
                    <span>{item.sourceLang} → {item.targetLang}</span>
                    <span>{new Date(item.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-sm text-slate-800 line-clamp-2 font-medium mb-1">{item.originalText}</p>
                  <p className="text-sm text-indigo-600 line-clamp-2">{item.translatedText}</p>
                  <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-[10px] px-1.5 py-0.5 bg-indigo-100 text-indigo-700 rounded">
                      {item.style === TranslationStyle.LITERAL ? '직역' : '의역'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
