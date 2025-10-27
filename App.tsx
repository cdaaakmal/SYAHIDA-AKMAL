import React, { useState, useCallback, useEffect } from 'react';
import { StudyMaterialType, GeneratedContent } from './types';
import { generateStudyMaterial } from './services/geminiService';
import ResultDisplay from './components/ResultDisplay';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center h-full">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">Generating your materials...</p>
    </div>
);

const WelcomeMessage = () => (
    <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-slate-800 dark:text-slate-200 mb-2">Welcome to the Sirahpidea Study Buddy!</h2>
        <p className="text-slate-600 dark:text-slate-400 max-w-2xl">
            Enter any topic from your studies on the left, choose the type of material you need, and let our AI assistant create it for you. Perfect for quick summaries, self-testing with quizzes, visualizing events with timelines, or memorizing key terms with flashcards.
        </p>
    </div>
);


const Header = () => {
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
            setDarkMode(true);
        } else {
            document.documentElement.classList.remove('dark');
            setDarkMode(false);
        }
    }, []);

    const toggleDarkMode = () => {
        if (darkMode) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        }
        setDarkMode(!darkMode);
    };

    return (
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10 p-4 shadow-md mb-8">
          <div className="container mx-auto flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-primary-600 dark:text-primary-400">
                  Sirahpidea Study Buddy
              </h1>
              <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  {darkMode ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                  ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                      </svg>
                  )}
              </button>
          </div>
      </header>
    );
};

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [materialType, setMaterialType] = useState<StudyMaterialType>(StudyMaterialType.SUMMARY);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const content = await generateStudyMaterial(topic, materialType);
      setGeneratedContent(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [topic, materialType]);

  const materialTypes = Object.values(StudyMaterialType);

  return (
    <>
      <Header />
      <main className="container mx-auto px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Controls Column */}
          <div className="lg:col-span-1 space-y-6">
             <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <label htmlFor="topic-input" className="block text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    1. Enter Your Topic
                </label>
                <textarea
                    id="topic-input"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The life of Prophet Muhammad in Mecca"
                    className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition"
                />
            </div>
             <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-4">2. Choose Material Type</h3>
                 <div className="grid grid-cols-2 gap-3">
                    {materialTypes.map((type) => (
                        <button
                            key={type}
                            onClick={() => setMaterialType(type)}
                            className={`px-4 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                                materialType === type
                                ? 'bg-primary-600 text-white shadow-md scale-105'
                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                            }`}
                        >
                            {type}
                        </button>
                    ))}
                 </div>
            </div>
             <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow-md">
                 <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-300 mb-2">3. Generate</h3>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-800 transition-colors duration-200 disabled:bg-slate-400 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                        </>
                    ) : (
                        "Create My Study Material"
                    )}
                </button>
             </div>
          </div>

          {/* Result Column */}
          <div className="lg:col-span-2 min-h-[60vh]">
            {isLoading && !generatedContent ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            ) : generatedContent ? (
              <ResultDisplay content={generatedContent} type={materialType} onRegenerate={handleGenerate} isRegenerating={isLoading}/>
            ) : (
                <WelcomeMessage />
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default App;