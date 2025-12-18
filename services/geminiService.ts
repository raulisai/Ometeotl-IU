
import { GoogleGenAI, Type } from "@google/genai";
import { Platform, UIElement, CanvasState } from "../types";

const UI_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    elements: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          type: { type: Type.STRING },
          name: { type: Type.STRING },
          tailwindClasses: { type: Type.STRING },
          content: { type: Type.STRING },
          style: {
            type: Type.OBJECT,
            properties: {
              backgroundColor: { type: Type.STRING },
              // Added missing background properties to schema
              backgroundGradient: { type: Type.STRING },
              backgroundImage: { type: Type.STRING },
              color: { type: Type.STRING },
              borderRadius: { type: Type.STRING },
              padding: { type: Type.STRING },
              fontSize: { type: Type.STRING },
              fontWeight: { type: Type.STRING },
              textAlign: { type: Type.STRING },
              textTransform: { type: Type.STRING },
              lineHeight: { type: Type.STRING },
              letterSpacing: { type: Type.STRING },
              borderWidth: { type: Type.STRING },
              borderColor: { type: Type.STRING },
              width: { type: Type.STRING },
              height: { type: Type.STRING },
              opacity: { type: Type.NUMBER },
              // Added effects and animation properties to schema
              boxShadow: { type: Type.STRING },
              backdropFilter: { type: Type.STRING },
              filter: { type: Type.STRING },
              objectFit: { type: Type.STRING },
              mixBlendMode: { type: Type.STRING },
              animation: { type: Type.STRING },
              transition: { type: Type.STRING },
              transform: { type: Type.STRING }
            }
          },
          position: {
            type: Type.OBJECT,
            properties: {
              x: { type: Type.NUMBER },
              y: { type: Type.NUMBER }
            }
          }
        },
        required: ['id', 'type', 'name', 'tailwindClasses', 'content']
      }
    },
    pageStyle: {
      type: Type.OBJECT,
      properties: {
        backgroundColor: { type: Type.STRING }
      }
    }
  },
  required: ['elements']
};

export const generateFullUI = async (prompt: string, platform: Platform, currentState?: CanvasState): Promise<{elements: UIElement[], pageStyle?: any}> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const systemInstruction = `You are a World-Class UI/UX Designer. 
  - When user wants 3D-like floating assets, use transparent backgrounds and deep shadows.
  - Return the COMPLETE list of elements and pageStyle.
  - Prioritize responsiveness and high-end visual aesthetics.`;

  const response = await ai.models.generateContent({
    model,
    contents: `Current State: ${JSON.stringify(currentState?.elements)}\nPlatform: ${platform}\nPrompt: ${prompt}`,
    config: { systemInstruction, responseMimeType: "application/json", responseSchema: UI_SCHEMA }
  });

  return JSON.parse(response.text || '{"elements":[], "pageStyle": {}}');
};

export const generateImageWithAI = async (prompt: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `${prompt}. Create a professional, high-end design asset. If the subject is a single object, place it on a clean, solid neutral background for professional extraction.` },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("No image data returned from AI");
};

export const refineImageWithAI = async (base64Image: string, instruction: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Extract the base64 data part (remove data:image/png;base64, if present)
  const base64Data = base64Image.split(',')[1] || base64Image;
  const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/png';

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType,
          },
        },
        { text: `${instruction}. Maintain the core subject but transform it according to the instructions. If the user asks to remove the background, isolate the main subject perfectly on a flat, neutral background suitable for a high-end UI element.` },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  throw new Error("Failed to refine image");
};

export const exportToCode = async (elements: UIElement[]): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Convert this UI design into a production React component using Tailwind CSS: ${JSON.stringify(elements)}`,
    config: {
      systemInstruction: "You are a master React developer. Return only code.",
    }
  });
  return response.text || '';
};
