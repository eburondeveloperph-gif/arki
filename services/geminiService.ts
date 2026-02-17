/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { FloorPlan, Wall, Opening } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a floor plan structure based on the user's prompt.
 */
export const generateFloorPlan = async (prompt: string): Promise<FloorPlan> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a floor plan layout for: "${prompt}". 
      Assume a coordinate system where 1 unit = 1 cm.
      A typical room might be 300-500 units wide.
      Provide a list of walls (start x,y to end x,y) and openings (doors/windows).
      Keep the layout centered around 400,300 approximately.
      Ensure walls connect perfectly at endpoints.
      Standard wall thickness is 20 units.`,
      config: {
        systemInstruction: "You are a professional architect. You output strict JSON geometry data for floor plans.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            walls: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  start: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                  },
                  end: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                  },
                  thickness: { type: Type.NUMBER },
                },
              },
            },
            openings: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["door", "window"] },
                  wallIndex: { type: Type.INTEGER },
                  offset: { type: Type.NUMBER, description: "Normalized position 0-1 along the wall" },
                  width: { type: Type.NUMBER },
                },
              },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    
    // Transform API response to our internal types with UUIDs
    const walls: Wall[] = (data.walls || []).map((w: any) => ({
      id: crypto.randomUUID(),
      start: w.start,
      end: w.end,
      thickness: w.thickness || 20
    }));

    const openings: Opening[] = (data.openings || []).map((o: any) => {
      // Map wallIndex to actual wall ID if possible
      const wallId = walls[o.wallIndex]?.id;
      if (!wallId) return null;
      return {
        id: crypto.randomUUID(),
        type: o.type,
        wallId: wallId,
        offset: o.offset,
        width: o.width || 90
      };
    }).filter((o: any) => o !== null);

    return {
      id: crypto.randomUUID(),
      walls,
      openings,
      name: prompt,
      timestamp: Date.now()
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate floor plan.");
  }
};