
import React from 'react';
import { Plus, Trash2, ChevronRight, ChevronDown, BookA, RefreshCw } from 'lucide-react';
import { GlossaryTerm } from '../types';

interface GlossaryEditorProps {
  terms: GlossaryTerm[];
  setTerms: (terms: GlossaryTerm[]) => void;
  isVisible: boolean;
  toggleVisibility: () => void;
  onRetranslate: () => void;
}

const GlossaryEditor: React.FC<GlossaryEditorProps> = ({
  terms,
  setTerms,
  isVisible,
  toggleVisibility,
  onRetranslate
}) => {
  const addTerm = () => {
    setTerms([...terms, { id: Date.now().toString(), source: '', target: '' }]);
  };

  const updateTerm = (id: string, field: 'source' | 'target', value: string) => {
    setTerms(terms.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTerm = (id: string) => {
    setTerms(terms.filter(t => t.id !== id));
  };

  // Calculate active count (terms with actual content)
  const activeCount = terms.filter(t => t.source.trim() !== '' || t.target.trim() !== '').length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 mb-6 overflow-hidden">
      <button
        onClick={toggleVisibility}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-slate-50 transition-colors text-left"
      >
        <div className="text-slate-400">
          {isVisible ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
        </div>
        
        <div className="flex items-center gap-2 text-slate-700 font-semibold text-sm">
          <BookA size={18} className="text-indigo-500" />
          사용자 정의 용어 사전 (Glossary)
        </div>
        
        <span className={`text-xs ml-auto px-2 py-1 rounded-full transition-colors ${
          activeCount > 0 
            ? 'bg-indigo-100 text-indigo-700 font-medium' 
            : 'bg-slate-100 text-slate-400 font-normal'
        }`}>
          {activeCount}개의 규칙 적용 중
        </span>
      </button>

      {isVisible && (
        <div className="px-4 pb-4 animate-fade-in border-t border-slate-100 pt-4">
          <p className="text-xs text-slate-500 mb-3 px-1">
            특정 단어의 번역을 지정합니다. 이 규칙은 <strong>번역 스타일보다 최우선</strong>으로 적용됩니다.
          </p>
          
          <div className="space-y-3">
            {terms.map((term, index) => (
              <div key={term.id} className="flex items-center gap-2 group">
                <span className="text-xs text-slate-300 w-4 text-center font-mono">{index + 1}</span>
                <input
                  type="text"
                  placeholder="원본 단어 (예: SanC)"
                  value={term.source}
                  onChange={(e) => updateTerm(term.id, 'source', e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <span className="text-slate-300">→</span>
                <input
                  type="text"
                  placeholder="번역 결과 (예: 이성 판정)"
                  value={term.target}
                  onChange={(e) => updateTerm(term.id, 'target', e.target.value)}
                  className="flex-1 p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                />
                <button
                  onClick={() => removeTerm(term.id)}
                  className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-3">
             <button
              onClick={addTerm}
              className="flex-1 py-2.5 border border-dashed border-indigo-200 text-indigo-600 rounded-lg text-sm font-medium hover:bg-indigo-50 transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> 용어 추가하기
            </button>
            <button
              onClick={onRetranslate}
              className="flex-1 py-2.5 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors flex items-center justify-center gap-2"
            >
              <RefreshCw size={16} /> 규칙 적용 및 재번역
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlossaryEditor;
