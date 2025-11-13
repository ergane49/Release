
import React, { useRef, useState, useEffect } from 'react';
import { Image as ImageIcon, Upload, X, Wand2, CheckCircle, Square, Loader2 } from 'lucide-react';
import { extractTextFromImage } from '../services/geminiService';

interface ImageUploaderProps {
  onTextExtracted: (text: string) => void;
  setLoading: (state: boolean) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onTextExtracted, setLoading }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedText, setExtractedText] = useState<string>('');
  const [step, setStep] = useState<'upload' | 'verify'>('upload');
  const abortRef = useRef(false);

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
      setStep('upload'); // Reset if new image
      setExtractedText('');
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const file = e.clipboardData.files[0];
        if (file.type.startsWith('image/')) {
          e.preventDefault();
          processFile(file);
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => {
      window.removeEventListener('paste', handlePaste);
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleOCR = async () => {
    if (!previewUrl) return;
    
    setIsExtracting(true);
    setLoading(true);
    abortRef.current = false;
    
    try {
      // Remove data:image/png;base64, prefix
      const base64Data = previewUrl.split(',')[1];
      const text = await extractTextFromImage(base64Data);
      
      if (!abortRef.current) {
        setExtractedText(text);
        setStep('verify');
      }
    } catch (error) {
      if (!abortRef.current) {
        console.error("Failed to extract text", error);
        alert("이미지에서 텍스트를 추출하지 못했습니다. 다른 이미지를 시도해 주세요.");
      }
    } finally {
      if (!abortRef.current) {
        setIsExtracting(false);
        setLoading(false);
      }
    }
  };

  const handleStopOCR = () => {
    abortRef.current = true;
    setIsExtracting(false);
    setLoading(false);
  };

  const handleConfirmText = () => {
    onTextExtracted(extractedText);
    setExtractedText('');
    setPreviewUrl(null);
    setStep('upload');
  };

  const clearImage = () => {
    setPreviewUrl(null);
    setExtractedText('');
    setStep('upload');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      className="mb-6 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm transition-colors hover:border-indigo-300"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      
      {/* Upload State */}
      {!previewUrl && (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className="p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 transition-colors"
        >
          <div className="bg-indigo-50 p-4 rounded-full mb-3 text-indigo-600">
            <Upload size={24} />
          </div>
          <h3 className="text-slate-900 font-medium mb-1">
            이미지를 클릭하거나, 드래그하거나,<br className="md:hidden" /> Ctrl+V로 붙여넣으세요
          </h3>
          <p className="text-slate-500 text-sm max-w-xs mt-1">JPG, PNG 지원. 텍스트를 자동으로 감지합니다.</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileChange}
          />
        </div>
      )}

      {/* Preview & OCR State */}
      {previewUrl && step === 'upload' && (
        <div className="p-4">
           <div className="relative rounded-lg overflow-hidden bg-slate-900 aspect-video flex items-center justify-center mb-4">
              <img src={previewUrl} alt="Preview" className="max-h-64 object-contain" />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  clearImage();
                }}
                className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full hover:bg-black/70"
              >
                <X size={16} />
              </button>
           </div>
           
           {isExtracting ? (
             <button
               onClick={handleStopOCR}
               className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
             >
               <Loader2 size={18} className="animate-spin" /> 중지 (추출 취소)
             </button>
           ) : (
             <button
               onClick={handleOCR}
               className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 transition-all"
             >
               <Wand2 size={18} /> 텍스트 감지 및 추출
             </button>
           )}
        </div>
      )}

      {/* Verify Text State */}
      {step === 'verify' && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
             <label className="text-sm font-bold text-slate-700">추출된 텍스트 확인</label>
             <span className="text-xs text-slate-400">필요 시 수정하세요</span>
          </div>
          
          {/* Increased font size back to text-sm as requested */}
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full h-60 p-3 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none mb-2 text-sm resize-none leading-relaxed"
          ></textarea>

          <p className="text-xs text-slate-500 mb-4">
             * 원문에서 문단이 잘려도, 실제 번역 시에는 한 개의 문장으로 자동 수정하여 번역합니다.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={clearImage}
              className="flex-1 py-2.5 text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg font-medium transition-colors"
            >
              취소
            </button>
            <button 
              onClick={handleConfirmText}
              className="flex-1 py-2.5 text-white bg-green-600 hover:bg-green-700 rounded-lg font-medium shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <CheckCircle size={18} /> 확인 및 번역
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
