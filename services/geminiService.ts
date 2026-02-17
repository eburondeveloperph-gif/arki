/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { GoogleGenAI, Type } from "@google/genai";
import { FloorPlan, Wall, Opening, Fixture } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a floor plan structure based on the user's prompt.
 */
export const generateFloorPlan = async (prompt: string): Promise<FloorPlan> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Generate a professional floor plan layout for: "${prompt}". 
      Assume a coordinate system where 1 unit = 1 cm.
      Walls should connect precisely. Include essential fixtures like beds and toilets.
      Scale: Rooms should be roughly 300x400 units.
      Standard wall thickness is 20 units.`,
      config: {
        systemInstruction: "You are a lead architect. You output strict JSON geometry data for floor plans including walls, doors, and fixtures.",
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
                  offset: { type: Type.NUMBER },
                  width: { type: Type.NUMBER },
                },
              },
            },
            fixtures: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING, enum: ["toilet", "sink", "bed", "sofa", "table"] },
                  pos: {
                    type: Type.OBJECT,
                    properties: { x: { type: Type.NUMBER }, y: { type: Type.NUMBER } },
                  },
                  rotation: { type: Type.NUMBER },
                  width: { type: Type.NUMBER },
                  depth: { type: Type.NUMBER },
                },
              },
            },
          },
        },
      },
    });

    const data = JSON.parse(response.text || '{}');
    
    const walls: Wall[] = (data.walls || []).map((w: any) => ({
      id: crypto.randomUUID(),
      start: w.start,
      end: w.end,
      thickness: w.thickness || 20
    }));

    const openings: Opening[] = (data.openings || []).map((o: any) => {
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

    const fixtures: Fixture[] = (data.fixtures || []).map((f: any) => ({
      id: crypto.randomUUID(),
      type: f.type,
      pos: f.pos,
      rotation: f.rotation || 0,
      width: f.width || 100,
      depth: f.depth || 100
    }));

    return {
      id: crypto.randomUUID(),
      walls,
      openings,
      fixtures,
      name: prompt,
      timestamp: Date.now()
    };

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    throw new Error(error.message || "Failed to generate floor plan.");
  }
};