import { GoogleGenAI, Type } from "@google/genai";
import { StudyMaterialType, QuizQuestion, TimelineEvent, Flashcard, GeneratedContent, ChatMessage } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const model = 'gemini-2.5-flash';

const quizSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      question: { type: Type.STRING },
      options: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
      },
      correctAnswer: { type: Type.STRING },
    },
    required: ['question', 'options', 'correctAnswer'],
  },
};

const timelineSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            date: { type: Type.STRING, description: "The year or specific date of the event." },
            event: { type: Type.STRING, description: "A short title for the event." },
            description: { type: Type.STRING, description: "A brief one-sentence description of the event." },
        },
        required: ['date', 'event', 'description'],
    }
};

const flashcardSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            term: { type: Type.STRING, description: "The key term or name." },
            definition: { type: Type.STRING, description: "A concise definition of the term." },
        },
        required: ['term', 'definition'],
    }
};

const getPromptAndConfig = (topic: string, type: StudyMaterialType, language: string) => {
  const languageMap: Record<string, string> = {
    en: 'English',
    ms: 'Malay',
    ar: 'Arabic',
  };
  const languageName = languageMap[language] || 'English';

  const basePrompt = `Based on the topic "${topic}", please generate the following content in ${languageName}.`;
  
  switch (type) {
    case StudyMaterialType.SUMMARY:
      return {
        prompt: `Provide a concise, easy-to-understand summary for the topic: "${topic}". Structure it in well-formed paragraphs. The output must be in ${languageName}.`,
        config: {},
      };
    case StudyMaterialType.QUIZ:
      return {
        prompt: `${basePrompt} Generate a 20-question multiple-choice quiz with 4 options for each question. Ensure one option is clearly correct.`,
        config: {
          responseMimeType: 'application/json',
          responseSchema: quizSchema,
        },
      };
    case StudyMaterialType.TIMELINE:
        return {
            prompt: `${basePrompt} Generate a timeline of at least 5 key events.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: timelineSchema,
            }
        };
    case StudyMaterialType.FLASHCARDS:
        return {
            prompt: `${basePrompt} Generate 8 flashcards with key terms and their definitions.`,
            config: {
                responseMimeType: 'application/json',
                responseSchema: flashcardSchema,
            }
        };
    default:
        throw new Error('Invalid study material type');
  }
};


export const generateStudyMaterial = async (topic: string, type: StudyMaterialType, language: string): Promise<GeneratedContent> => {
    try {
        const { prompt, config } = getPromptAndConfig(topic, type, language);

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: config,
        });

        const text = response.text;
        
        if (type === StudyMaterialType.SUMMARY) {
            return text;
        } else {
            // The AI can sometimes wrap the JSON response in markdown backticks.
            // We need to strip them before parsing.
            let cleanedText = text.trim();
            if (cleanedText.startsWith("```json")) {
                cleanedText = cleanedText.substring(7, cleanedText.length - 3).trim();
            } else if (cleanedText.startsWith("```")) {
                 cleanedText = cleanedText.substring(3, cleanedText.length - 3).trim();
            }
            
            try {
                return JSON.parse(cleanedText) as GeneratedContent;
            } catch (e) {
                console.error("Failed to parse JSON from AI response:", { originalText: text, cleanedText, error: e });
                throw new Error("The AI returned an invalid response format. Please try regenerating.");
            }
        }

    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate content: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating content.');
    }
};

export const generateChatResponse = async (
    topic: string, 
    language: string, 
    history: ChatMessage[], 
    newMessage: string
): Promise<string> => {
    try {
        const languageMap: Record<string, string> = {
            en: 'English',
            ms: 'Malay',
            ar: 'Arabic',
        };
        const languageName = languageMap[language] || 'English';

        const systemInstruction = `You are a helpful and friendly study assistant for 'Sirahpidea'. 
        You will answer questions about the topic: "${topic}". 
        Your knowledge is strictly limited to this topic.
        If the user asks about anything else, politely state that you can only discuss the selected topic and guide them back.
        Keep your answers concise and easy for a student to understand.
        You must answer in ${languageName}.`;

        const contents = [
            ...history.map(msg => ({
                role: msg.role as 'user' | 'model',
                parts: [{ text: msg.text }],
            })),
            { role: 'user' as const, parts: [{ text: newMessage }] },
        ];

        const response = await ai.models.generateContent({
            model,
            contents,
            config: {
                systemInstruction,
            },
        });
        
        return response.text;

    } catch (error) {
        console.error("Error generating chat response from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to get chat response: ${error.message}`);
        }
        throw new Error('An unknown error occurred while getting chat response.');
    }
};
