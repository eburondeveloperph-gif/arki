/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState, useEffect } from 'react';
import { FloorPlan, ToolType, Point, Wall, Opening } from '../types';

interface EditorCanvasProps {
  plan: FloorPlan;
  activeTool: ToolType;
  onUpdatePlan: (plan: FloorPlan) => void;
}

const SNAP_GRID = 20; // 20 units (cm) snap

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ plan, activeTool, onUpdatePlan }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [currentMouse, setCurrentMouse] = useState<Point>({ x: 0, y: 0 });
  const [hoverWallId, setHoverWallId] = useState<string | null>(null);

  // Helper: Snap to grid
  const snap = (val: number) => Math.round(val / SNAP_GRID) * SNAP_GRID;
  const getMousePos = (e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: snap(e.clientX - rect.left),
      y: snap(e.clientY - rect.top)
    };
  };

  // Helper: Distance point to segment
  const distToSegment = (p: Point, v: Point, w: Point) => {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  };

  // Helper: Get length of wall
  const getWallLength = (w: Wall) => Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y);

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    if (activeTool === 'wall') {
      setDragStart(pos);
    } else if ((activeTool === 'door' || activeTool === 'window') && hoverWallId) {
      // Add opening
      // Calculate offset
      const wall = plan.walls.find(w => w.id === hoverWallId);
      if (wall) {
        // Project point to line to get precise offset
        const totalLen = getWallLength(wall);
        const distFromStart = Math.hypot(pos.x - wall.start.x, pos.y - wall.start.y);
        const offset = Math.max(0, Math.min(1, distFromStart / totalLen));
        
        const newOpening: Opening = {
            id: crypto.randomUUID(),
            type: activeTool,
            wallId: hoverWallId,
            offset: offset,
            width: activeTool === 'door' ? 90 : 120
        };
        onUpdatePlan({ ...plan, openings: [...plan.openings, newOpening] });
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    setCurrentMouse(pos);

    // Wall Hover Detection
    if (activeTool === 'door' || activeTool === 'window') {
      let closestDist = Infinity;
      let closestId = null;
      plan.walls.forEach(w => {
        const d = distToSegment(pos, w.start, w.end);
        if (d < 20 && d < closestDist) {
          closestDist = d;
          closestId = w.id;
        }
      });
      setHoverWallId(closestId);
    }
  };

  const handleMouseUp = () => {
    if (activeTool === 'wall' && dragStart) {
      // Create Wall
      // Don't create zero length walls
      if (dragStart.x !== currentMouse.x || dragStart.y !== currentMouse.y) {
        const newWall: Wall = {
          id: crypto.randomUUID(),
          start: dragStart,
          end: currentMouse,
          thickness: 20
        };
        onUpdatePlan({ ...plan, walls: [...plan.walls, newWall] });
      }
      setDragStart(null);
    }
  };

  // Render Grid
  const renderGrid = () => {
    return (
      <defs>
        <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
          <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
          <path d="M 80 0 L 0 0 0 80" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
        </pattern>
      </defs>
    );
  };

  return (
    <div className="flex-1 bg-zinc-950 overflow-hidden relative cursor-crosshair">
      <svg
        ref={svgRef}
        width="100%"
        height="100%"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        className="block"
      >
        {renderGrid()}
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Render Walls */}
        <g>
          {plan.walls.map(wall => {
            const isHovered = wall.id === hoverWallId;
            return (
              <g key={wall.id}>
                <line
                  x1={wall.start.x}
                  y1={wall.start.y}
                  x2={wall.end.x}
                  y2={wall.end.y}
                  stroke={isHovered ? '#60a5fa' : '#52525b'}
                  strokeWidth={wall.thickness}
                  strokeLinecap="square"
                  className="transition-colors duration-200"
                />
                {/* Wall Centerline (Drafting Style) */}
                <line
                  x1={wall.start.x}
                  y1={wall.start.y}
                  x2={wall.end.x}
                  y2={wall.end.y}
                  stroke="#71717a"
                  strokeWidth="1"
                  strokeDasharray="4 4"
                  opacity="0.5"
                />
                {/* Wall Dimensions (Auto) */}
                <text
                  x={(wall.start.x + wall.end.x) / 2}
                  y={(wall.start.y + wall.end.y) / 2 - 15}
                  textAnchor="middle"
                  fill="#71717a"
                  fontSize="10"
                  fontFamily="monospace"
                >
                  {Math.round(getWallLength(wall))}
                </text>
              </g>
            );
          })}
        </g>

        {/* Render Openings */}
        <g>
          {plan.openings.map(opening => {
            const wall = plan.walls.find(w => w.id === opening.wallId);
            if (!wall) return null;
            
            // Interpolate position
            const x = wall.start.x + (wall.end.x - wall.start.x) * opening.offset;
            const y = wall.start.y + (wall.end.y - wall.start.y) * opening.offset;
            const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x) * 180 / Math.PI;

            return (
              <g key={opening.id} transform={`translate(${x},${y}) rotate(${angle})`}>
                 {/* Cutout */}
                 <rect x={-opening.width/2} y={-wall.thickness/2 - 2} width={opening.width} height={wall.thickness + 4} fill="#09090b" />
                 
                 {opening.type === 'door' && (
                   <g>
                      {/* Door Swing Arc */}
                      <path d={`M ${-opening.width/2} ${-opening.width} A ${opening.width} ${opening.width} 0 0 1 ${opening.width/2} 0`} fill="none" stroke="#fbbf24" strokeWidth="1" strokeDasharray="4 2"/>
                      {/* Door Leaf */}
                      <line x1={-opening.width/2} y1={0} x2={-opening.width/2} y2={-opening.width} stroke="#fbbf24" strokeWidth="2" />
                   </g>
                 )}

                 {opening.type === 'window' && (
                    <g>
                      <rect x={-opening.width/2} y={-2} width={opening.width} height={4} fill="none" stroke="#38bdf8" strokeWidth="1" />
                      <line x1={-opening.width/2} y1={0} x2={opening.width/2} y2={0} stroke="#38bdf8" strokeWidth="1" />
                    </g>
                 )}
              </g>
            );
          })}
        </g>

        {/* Render Preview Wall */}
        {activeTool === 'wall' && dragStart && (
           <g>
             <line
               x1={dragStart.x}
               y1={dragStart.y}
               x2={currentMouse.x}
               y2={currentMouse.y}
               stroke="#60a5fa"
               strokeWidth="20"
               opacity="0.5"
             />
             <line
                x1={dragStart.x}
                y1={dragStart.y}
                x2={currentMouse.x}
                y2={currentMouse.y}
                stroke="#3b82f6"
                strokeWidth="2"
                strokeDasharray="4 2"
             />
              <text
                  x={(dragStart.x + currentMouse.x) / 2}
                  y={(dragStart.y + currentMouse.y) / 2 - 20}
                  textAnchor="middle"
                  fill="#60a5fa"
                  fontSize="12"
                  fontWeight="bold"
                  className="bg-black"
                >
                  {Math.round(Math.hypot(currentMouse.x - dragStart.x, currentMouse.y - dragStart.y))}
              </text>
           </g>
        )}
        
        {/* Render Ghost Opening */}
        {(activeTool === 'door' || activeTool === 'window') && hoverWallId && (
            <circle cx={currentMouse.x} cy={currentMouse.y} r="5" fill={activeTool === 'door' ? '#fbbf24' : '#38bdf8'} opacity="0.8" />
        )}

      </svg>
      
      {/* Coordinates Status */}
      <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur px-3 py-1 rounded text-xs font-mono text-zinc-500 border border-white/5 pointer-events-none">
         X: {currentMouse.x} Y: {currentMouse.y}
      </div>
    </div>
  );
};