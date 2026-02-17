/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number; // in logical units (e.g., cm)
}

export interface Opening {
  id: string;
  type: 'door' | 'window';
  wallId: string;
  offset: number; // 0 to 1 (normalized position along wall)
  width: number; // width in logical units
}

export interface FloorPlan {
  id: string;
  walls: Wall[];
  openings: Opening[];
  name?: string;
  timestamp: number;
}

export interface ApiError {
  message: string;
  details?: string;
}

export type ToolType = 'select' | 'wall' | 'door' | 'window' | 'measure';

// Added GeneratedSvg interface to fix import error in SvgPreview.tsx
export interface GeneratedSvg {
  id: string;
  content: string;
  prompt: string;
}