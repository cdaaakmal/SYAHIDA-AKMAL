import React from 'react';
import { HistoryItem, GeneratedContent } from '../types';

interface HistoryViewerProps {
  history: HistoryItem[];
  onSelect: (content: GeneratedContent) => void;
  t: (key: string) => string;
  language: string;
}

const HistoryViewer: React.FC<HistoryViewerProps> = ({ history, onSelect, t, language }) => {
  if (!history || history.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${language === 'ar' ? 'ml-2' : 'mr-2'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        {t('generationHistory')}
      </h3>
      <div className="max-h-48 overflow-y-auto space-y-2 pr-2" dir="ltr">
        {history.map((item) => (
          <button
            key={item.timestamp}
            onClick={() => onSelect(item.content)}
            className="w-full text-left p-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/50 dark:hover:bg-slate-700 transition-colors duration-200"
          >
            <p className={`font-medium text-sm text-slate-800 dark:text-slate-200 ${language === 'ar' ? 'text-right' : 'text-left'}`}>{t('generatedOn')}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {new Date(item.timestamp).toLocaleString(language, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default HistoryViewer;
