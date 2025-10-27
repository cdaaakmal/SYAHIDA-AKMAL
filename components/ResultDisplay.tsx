import React, { useState } from 'react';
import { StudyMaterialType, GeneratedContent, QuizQuestion, TimelineEvent, Flashcard } from '../types';

interface ResultDisplayProps {
  content: GeneratedContent | null;
  type: StudyMaterialType;
  onRegenerate: () => void;
  isRegenerating: boolean;
}

interface DisplayComponentProps {
    onRegenerate: () => void;
    isRegenerating: boolean;
}

const RegenerateButton: React.FC<DisplayComponentProps> = ({ onRegenerate, isRegenerating }) => (
    <button
        onClick={onRegenerate}
        disabled={isRegenerating}
        className="flex items-center justify-center bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 font-semibold py-2 px-4 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-800 transition-colors duration-200 disabled:bg-slate-200 disabled:text-slate-500 disabled:cursor-not-allowed"
        aria-label="Regenerate content"
    >
        {isRegenerating ? (
            <>
                <svg className="animate-spin -ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Regenerating...
            </>
        ) : (
            <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 0h24v24H0z" fill="none"/>
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                Regenerate
            </>
        )}
    </button>
);


const SummaryDisplay: React.FC<{ content: string } & DisplayComponentProps> = ({ content, onRegenerate, isRegenerating }) => (
  <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
    <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{StudyMaterialType.SUMMARY}</h3>
        <RegenerateButton onRegenerate={onRegenerate} isRegenerating={isRegenerating} />
    </div>
    <div className="prose prose-slate dark:prose-invert max-w-none">
      {content.split('\n').map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  </div>
);

const QuizDisplay: React.FC<{ content: QuizQuestion[] } & DisplayComponentProps> = ({ content, onRegenerate, isRegenerating }) => {
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleAnswerChange = (questionIndex: number, answer: string) => {
        if (isSubmitted) return;
        setSelectedAnswers(prev => ({ ...prev, [questionIndex]: answer }));
    };

    const handleSubmit = () => {
        setIsSubmitted(true);
    };
    
    const getScore = () => {
        return content.reduce((score, question, index) => {
            return score + (selectedAnswers[index] === question.correctAnswer ? 1 : 0);
        }, 0);
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{StudyMaterialType.QUIZ}</h3>
                 <div className="flex items-center gap-4">
                    {isSubmitted && (
                        <div className="text-lg font-semibold bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300 px-4 py-2 rounded-full">
                            Score: {getScore()} / {content.length}
                        </div>
                    )}
                    <RegenerateButton onRegenerate={onRegenerate} isRegenerating={isRegenerating} />
                 </div>
            </div>
            <div className="space-y-6">
                {content.map((q, qIndex) => (
                    <div key={qIndex} className="border-b border-slate-200 dark:border-slate-700 pb-4">
                        <p className="font-semibold text-lg mb-3 text-slate-800 dark:text-slate-200">{qIndex + 1}. {q.question}</p>
                        <div className="space-y-2">
                            {q.options.map((option, oIndex) => {
                                const isCorrect = option === q.correctAnswer;
                                const isSelected = selectedAnswers[qIndex] === option;
                                let optionClass = "border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700";

                                if (isSubmitted) {
                                    if (isCorrect) {
                                        optionClass = "bg-green-100 border-green-400 text-green-800 dark:bg-green-900 dark:border-green-600 dark:text-green-200";
                                    } else if (isSelected) {
                                        optionClass = "bg-red-100 border-red-400 text-red-800 dark:bg-red-900 dark:border-red-600 dark:text-red-200";
                                    }
                                } else if (isSelected) {
                                    optionClass = "bg-primary-100 border-primary-400 dark:bg-primary-900 dark:border-primary-600";
                                }

                                return (
                                    <label key={oIndex} className={`flex items-center p-3 rounded-md border cursor-pointer transition-all duration-200 ${optionClass}`}>
                                        <input
                                            type="radio"
                                            name={`question-${qIndex}`}
                                            value={option}
                                            checked={isSelected}
                                            onChange={() => handleAnswerChange(qIndex, option)}
                                            disabled={isSubmitted}
                                            className="w-4 h-4 mr-3 text-primary-600 bg-slate-100 border-slate-300 focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-slate-800 focus:ring-2 dark:bg-slate-700 dark:border-slate-600"
                                        />
                                        <span>{option}</span>
                                    </label>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>
            {!isSubmitted && (
                 <button 
                    onClick={handleSubmit} 
                    className="mt-6 w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:bg-slate-400"
                    disabled={Object.keys(selectedAnswers).length !== content.length}
                >
                    Submit Quiz
                </button>
            )}
        </div>
    );
};

const TimelineDisplay: React.FC<{ content: TimelineEvent[] } & DisplayComponentProps> = ({ content, onRegenerate, isRegenerating }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{StudyMaterialType.TIMELINE}</h3>
            <RegenerateButton onRegenerate={onRegenerate} isRegenerating={isRegenerating} />
        </div>
        <div className="relative border-l-2 border-primary-300 dark:border-primary-700 ml-4">
            {content.map((item, index) => (
                <div key={index} className="mb-8 ml-8">
                    <span className="absolute flex items-center justify-center w-8 h-8 bg-primary-200 rounded-full -left-4 ring-4 ring-white dark:ring-slate-800 dark:bg-primary-900">
                         <svg className="w-4 h-4 text-primary-600 dark:text-primary-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4Z M0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z"/>
                        </svg>
                    </span>
                    <h4 className="flex items-center mb-1 text-lg font-semibold text-slate-900 dark:text-white">{item.event}</h4>
                    <time className="block mb-2 text-sm font-normal leading-none text-slate-500 dark:text-slate-400">{item.date}</time>
                    <p className="text-base font-normal text-slate-600 dark:text-slate-300">{item.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const FlashcardDisplay: React.FC<{ content: Flashcard[] } & DisplayComponentProps> = ({ content, onRegenerate, isRegenerating }) => {
    const [flipped, setFlipped] = useState<Record<number, boolean>>({});

    const handleFlip = (index: number) => {
        setFlipped(prev => ({...prev, [index]: !prev[index]}));
    }

    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-md">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-primary-600 dark:text-primary-400">{StudyMaterialType.FLASHCARDS}</h3>
                <RegenerateButton onRegenerate={onRegenerate} isRegenerating={isRegenerating} />
            </div>
            <p className="text-slate-500 dark:text-slate-400 mb-6">Click on a card to flip it.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {content.map((card, index) => (
                    <div key={index} className="perspective-1000" onClick={() => handleFlip(index)}>
                        <div className={`relative w-full h-48 transition-transform duration-500 transform-style-preserve-3d ${flipped[index] ? 'rotate-y-180' : ''}`}>
                            {/* Front of card */}
                            <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-4 bg-primary-500 text-white rounded-lg shadow-lg cursor-pointer">
                                <h4 className="text-xl font-bold text-center">{card.term}</h4>
                            </div>
                            {/* Back of card */}
                             <div className="absolute w-full h-full backface-hidden flex items-center justify-center p-4 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg shadow-lg cursor-pointer rotate-y-180">
                                <p className="text-center">{card.definition}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
             <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-preserve-3d { transform-style: preserve-3d; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .backface-hidden { backface-visibility: hidden; }
            `}</style>
        </div>
    );
};


const ResultDisplay: React.FC<ResultDisplayProps> = ({ content, type, onRegenerate, isRegenerating }) => {
  if (!content) {
    return null;
  }

  switch (type) {
    case StudyMaterialType.SUMMARY:
      return <SummaryDisplay content={content as string} onRegenerate={onRegenerate} isRegenerating={isRegenerating} />;
    case StudyMaterialType.QUIZ:
      return <QuizDisplay content={content as QuizQuestion[]} onRegenerate={onRegenerate} isRegenerating={isRegenerating} />;
    case StudyMaterialType.TIMELINE:
      return <TimelineDisplay content={content as TimelineEvent[]} onRegenerate={onRegenerate} isRegenerating={isRegenerating} />;
    case StudyMaterialType.FLASHCARDS:
        return <FlashcardDisplay content={content as Flashcard[]} onRegenerate={onRegenerate} isRegenerating={isRegenerating} />;
    default:
      return <div className="text-red-500">Error: Unknown content type.</div>;
  }
};

export default ResultDisplay;