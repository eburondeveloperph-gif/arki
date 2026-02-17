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
  thickness: number; // in logical units (cm)
  name?: string;
}

export interface Opening {
  id: string;
  type: 'door' | 'window';
  wallId: string;
  offset: number; // 0 to 1
  width: number;
  subType?: string; // e.g., "sliding", "swing", "fixed"
}

export interface Fixture {
  id: string;
  type: 'toilet' | 'sink' | 'shower' | 'bed' | 'sofa' | 'table';
  pos: Point;
  rotation: number;
  width: number;
  depth: number;
}

export interface FloorPlan {
  id: string;
  walls: Wall[];
  openings: Opening[];
  fixtures: Fixture[];
  name?: string;
  timestamp: number;
}

export interface ApiError {
  message: string;
  details?: string;
}

export type ToolType = 'select' | 'wall' | 'door' | 'window' | 'fixture' | 'measure';

export interface GeneratedSvg {
  id: string;
  content: string;
  prompt: string;
}
