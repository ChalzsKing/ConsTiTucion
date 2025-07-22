
import { GoogleGenAI, Type } from "@google/genai";
import { Course } from '../types';

export const isGeminiAvailable = (): boolean => {
  return !!process.env.API_KEY;
};

const courseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: "Título conciso y atractivo para un curso sobre el tema proporcionado. Máximo 5-7 palabras."
        },
        description: {
            type: Type.STRING,
            description: "Breve descripción del curso (2-3 frases) que resuma su objetivo y contenido principal."
        },
        modules: {
            type: Type.ARRAY,
            description: "Lista de los módulos del curso. Debe haber entre 5 y 8 módulos.",
            items: {
                type: Type.OBJECT,
                properties: {
                    title: {
                        type: Type.STRING,
                        description: "Título claro y descriptivo para el módulo."
                    },
                    sections: {
                        type: Type.ARRAY,
                        description: "Las lecciones o secciones de este módulo. Cada módulo debe tener entre 3 y 5 secciones.",
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                title: {
                                    type: Type.STRING,
                                    description: "Título de la lección o sección específica."
                                },
                                content: {
                                    type: Type.STRING,
                                    description: "Contenido educativo detallado para esta lección. Debe estar escrito en español y formateado en Markdown. Utiliza encabezados de varios niveles (p. ej., '## Título Principal', '### Subtítulo'), listas con viñetas ('- Elemento'), listas numeradas ('1. Elemento'), texto en negrita ('**importante**') y fragmentos de código (`código`). Para resaltar términos clave como si fueran etiquetas o píldoras, utiliza la sintaxis '++término clave++'. El contenido debe ser sustancial y cubrir el tema de la sección a fondo."
                                }
                            },
                            required: ["title", "content"]
                        }
                    }
                },
                required: ["title", "sections"]
            }
        }
    },
    required: ["title", "description", "modules"]
};

const courseSuggestionsSchema = {
    type: Type.OBJECT,
    properties: {
        suggestions: {
            type: Type.ARRAY,
            description: "Una lista de 5 temas de cursos sugeridos.",
            items: {
                type: Type.STRING,
                description: "Un tema sugerido para un curso."
            }
        }
    },
    required: ["suggestions"]
};

export const generateCourse = async (topic: string): Promise<Omit<Course, 'id' | 'createdAt'>> => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        throw new Error("La función de IA está deshabilitada. Por favor, configure la clave de API de Gemini.");
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Genera un curso completo sobre el tema: "${topic}".`,
            config: {
                systemInstruction: "Eres un experto diseñador de cursos y un pedagogo de clase mundial. Tu tarea es crear un sílabo completo y el contenido de las lecciones para un curso sobre un tema determinado. Estructura la salida en el formato JSON especificado. Para el contenido de cada sección, utiliza el formato Markdown para mejorar la legibilidad y la estructura, como si fuera para una presentación de alta calidad. Todo el contenido debe estar en español.",
                responseMimeType: "application/json",
                responseSchema: courseSchema,
            },
        });

        const jsonText = result.text.trim();
        const courseData = JSON.parse(jsonText);
        
        // Basic validation
        if (!courseData.title || !courseData.modules || courseData.modules.length === 0) {
            throw new Error("Invalid course structure received from AI.");
        }

        return courseData;
    } catch (error) {
        console.error("Error generating course with Gemini:", error);
        throw new Error("No se pudo generar el curso. Por favor, inténtelo de nuevo más tarde.");
    }
};

export const generateCourseSuggestions = async (courseTitles: string[]): Promise<string[]> => {
    const API_KEY = process.env.API_KEY;
    if (courseTitles.length === 0 || !API_KEY) {
        return [];
    }
    const ai = new GoogleGenAI({ apiKey: API_KEY });

    try {
        const result = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Basado en los siguientes títulos de cursos que un usuario ya ha creado: [${courseTitles.join(', ')}], sugiere 5 nuevos temas de cursos relacionados pero distintos.`,
            config: {
                systemInstruction: "Eres un motor de recomendación inteligente. Sugiere temas de cursos complementarios o que representen un siguiente paso lógico en el aprendizaje del usuario. Las sugerencias deben ser solo los títulos de los cursos. Devuelve la respuesta en español.",
                responseMimeType: "application/json",
                responseSchema: courseSuggestionsSchema,
            }
        });

        const jsonText = result.text.trim();
        const suggestionData = JSON.parse(jsonText);
        
        if (!suggestionData.suggestions || !Array.isArray(suggestionData.suggestions)) {
            console.error("Invalid suggestions structure received from AI.");
            return [];
        }
        
        return suggestionData.suggestions;

    } catch (error) {
        console.error("Error generating course suggestions with Gemini:", error);
        return [];
    }
};

export const synthesizeSpeech = async (text: string): Promise<{ success: boolean; audioContent?: string; error?: string; }> => {
    const API_KEY = process.env.API_KEY;
    if (!API_KEY) {
        return { success: false, error: "La función de texto a voz está deshabilitada. Por favor, configure la clave de API." };
    }

    const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;
    
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text: text },
                voice: { languageCode: 'es-ES', name: 'es-ES-Neural2-A' },
                audioConfig: { audioEncoding: 'MP3' }
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Failed to parse error response.' } }));
            const apiError = errorData.error;
            let errorMessage = `API Error: ${apiError?.message || 'Unknown error'}`;
            
            if (apiError?.reason === 'API_KEY_INVALID' || (apiError?.message && apiError.message.includes('API key not valid'))) {
                errorMessage = "La clave de API no es válida para el servicio de Texto a Voz. Por favor, asegúrate de que la 'Cloud Text-to-Speech API' esté habilitada en tu proyecto de Google Cloud para esta clave y que la facturación esté activada.";
            }
            return { success: false, error: errorMessage };
        }

        const data = await response.json();
        if (!data.audioContent) {
            return { success: false, error: "Respuesta inválida de la API de Texto a Voz: no se encontró contenido de audio." };
        }
        
        return { success: true, audioContent: data.audioContent };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Error de red al intentar contactar la API de Texto a Voz.";
        return { success: false, error: errorMessage };
    }
};
