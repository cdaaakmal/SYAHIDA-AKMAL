
import { GoogleGenAI, Type } from "@google/genai";
import { StudyMaterialType, QuizQuestion, TimelineEvent, Flashcard, GeneratedContent } from '../types';

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

const getPromptAndConfig = (topic: string, type: StudyMaterialType) => {
  const basePrompt = `Based on the topic "${topic}", please generate the following content.`;
  
  switch (type) {
    case StudyMaterialType.SUMMARY:
      return {
        prompt: `Provide a concise, easy-to-understand summary for the topic: "${topic}". Structure it in well-formed paragraphs.`,
        config: {},
      };
    case StudyMaterialType.QUIZ:
      return {
        prompt: `${basePrompt} Generate a 5-question multiple-choice quiz with 4 options for each question. Ensure one option is clearly correct.`,
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


export const generateStudyMaterial = async (topic: string, type: StudyMaterialType): Promise<GeneratedContent> => {
    try {
        const { prompt, config } = getPromptAndConfig(topic, type);

        const response = await ai.models.generateContent({
            model: model,
            contents: prompt,
            config: config,
        });

        const text = response.text;
        
        if (type === StudyMaterialType.SUMMARY) {
            return text;
        } else {
            return JSON.parse(text) as GeneratedContent;
        }

    } catch (error) {
        console.error("Error generating content from Gemini:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate content: ${error.message}`);
        }
        throw new Error('An unknown error occurred while generating content.');
    }
};
   