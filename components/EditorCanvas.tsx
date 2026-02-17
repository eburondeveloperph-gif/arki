/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useRef, useState } from 'react';
import { FloorPlan, ToolType, Point, Wall, Opening, Fixture } from '../types';

interface EditorCanvasProps {
  plan: FloorPlan;
  activeTool: ToolType;
  onUpdatePlan: (plan: FloorPlan) => void;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

const SNAP_GRID = 20;

export const EditorCanvas: React.FC<EditorCanvasProps> = ({ plan, activeTool, onUpdatePlan, selectedId, onSelect }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);
  const [currentMouse, setCurrentMouse] = useState<Point>({ x: 0, y: 0 });
  const [hoverWallId, setHoverWallId] = useState<string | null>(null);

  const snap = (val: number) => Math.round(val / SNAP_GRID) * SNAP_GRID;
  const getMousePos = (e: React.MouseEvent): Point => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: snap(e.clientX - rect.left),
      y: snap(e.clientY - rect.top)
    };
  };

  const getWallLength = (w: Wall) => Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y);

  const distToSegment = (p: Point, v: Point, w: Point) => {
    const l2 = (v.x - w.x) ** 2 + (v.y - w.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
    let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const pos = getMousePos(e);
    
    if (activeTool === 'select') {
      // Find what's under mouse
      // Check fixtures first
      const hitFixture = plan.fixtures.find(f => Math.hypot(f.pos.x - pos.x, f.pos.y - pos.y) < 25);
      if (hitFixture) {
        onSelect(hitFixture.id);
        return;
      }
      // Check walls
      let closestWall = null;
      let minDist = 15;
      plan.walls.forEach(w => {
        const d = distToSegment(pos, w.start, w.end);
        if (d < minDist) {
          minDist = d;
          closestWall = w.id;
        }
      });
      onSelect(closestWall);
    } else if (activeTool === 'wall') {
      setDragStart(pos);
    } else if (activeTool === 'fixture') {
      const newFixture: Fixture = {
        id: crypto.randomUUID(),
        type: 'bed', // Default
        pos: pos,
        rotation: 0,
        width: 160,
        depth: 200
      };
      onUpdatePlan({ ...plan, fixtures: [...plan.fixtures, newFixture] });
    } else if ((activeTool === 'door' || activeTool === 'window') && hoverWallId) {
      const wall = plan.walls.find(w => w.id === hoverWallId);
      if (wall) {
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

    if (activeTool === 'door' || activeTool === 'window') {
      let closestDist = Infinity;
      let closestId = null;
      plan.walls.forEach(w => {
        const d = distToSegment(pos, w.start, w.end);
        if (d < 25 && d < closestDist) {
          closestDist = d;
          closestId = w.id;
        }
      });
      setHoverWallId(closestId);
    }
  };

  const handleMouseUp = () => {
    if (activeTool === 'wall' && dragStart) {
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

  const renderGrid = () => (
    <defs>
      <pattern id="grid" width="100" height="100" patternUnits="userSpaceOnUse">
        <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1"/>
        <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5"/>
      </pattern>
    </defs>
  );

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
        
        {/* Walls */}
        <g>
          {plan.walls.map(wall => {
            const isSelected = wall.id === selectedId;
            const isHovered = wall.id === hoverWallId;
            return (
              <g key={wall.id} onClick={() => activeTool === 'select' && onSelect(wall.id)}>
                <line
                  x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y}
                  stroke={isSelected ? '#3b82f6' : (isHovered ? '#60a5fa' : '#3f3f46')}
                  strokeWidth={wall.thickness}
                  strokeLinecap="square"
                  className="transition-all duration-200"
                />
                <line
                  x1={wall.start.x} y1={wall.start.y} x2={wall.end.x} y2={wall.end.y}
                  stroke="#71717a" strokeWidth="1" strokeDasharray="4 4" opacity="0.3"
                />
                <text
                  x={(wall.start.x + wall.end.x) / 2}
                  y={(wall.start.y + wall.end.y) / 2 - 15}
                  textAnchor="middle" fill="#52525b" fontSize="9" fontFamily="monospace"
                >
                  {Math.round(getWallLength(wall))}
                </text>
              </g>
            );
          })}
        </g>

        {/* Fixtures */}
        <g>
          {plan.fixtures.map(f => {
            const isSelected = f.id === selectedId;
            return (
              <g key={f.id} transform={`translate(${f.pos.x},${f.pos.y}) rotate(${f.rotation})`}>
                <rect 
                  x={-f.width/2} y={-f.depth/2} width={f.width} height={f.depth} 
                  fill="none" stroke={isSelected ? '#3b82f6' : '#a1a1aa'} strokeWidth="1"
                  strokeDasharray={isSelected ? "none" : "2 1"}
                />
                {f.type === 'bed' && (
                  <g opacity="0.5">
                    <rect x={-f.width/2 + 5} y={-f.depth/2 + 5} width={f.width-10} height={40} fill="none" stroke="#a1a1aa" />
                    <line x1={0} y1={-f.depth/2+5} x2={0} y2={-f.depth/2+45} stroke="#a1a1aa" />
                  </g>
                )}
                <text y={5} textAnchor="middle" fill="#52525b" fontSize="8" className="uppercase tracking-widest">{f.type}</text>
              </g>
            );
          })}
        </g>

        {/* Openings */}
        <g>
          {plan.openings.map(o => {
            const wall = plan.walls.find(w => w.id === o.wallId);
            if (!wall) return null;
            const x = wall.start.x + (wall.end.x - wall.start.x) * o.offset;
            const y = wall.start.y + (wall.end.y - wall.start.y) * o.offset;
            const angle = Math.atan2(wall.end.y - wall.start.y, wall.end.x - wall.start.x) * 180 / Math.PI;
            const isSelected = o.id === selectedId;

            return (
              <g key={o.id} transform={`translate(${x},${y}) rotate(${angle})`} onClick={() => activeTool === 'select' && onSelect(o.id)}>
                 <rect x={-o.width/2} y={-wall.thickness/2 - 2} width={o.width} height={wall.thickness + 4} fill="#09090b" />
                 {o.type === 'door' && (
                   <g>
                      <path d={`M ${-o.width/2} ${-o.width} A ${o.width} ${o.width} 0 0 1 ${o.width/2} 0`} fill="none" stroke={isSelected ? '#3b82f6' : '#fbbf24'} strokeWidth="1" strokeDasharray="4 2"/>
                      <line x1={-o.width/2} y1={0} x2={-o.width/2} y2={-o.width} stroke={isSelected ? '#3b82f6' : '#fbbf24'} strokeWidth="2" />
                   </g>
                 )}
                 {o.type === 'window' && (
                    <g>
                      <rect x={-o.width/2} y={-2} width={o.width} height={4} fill="none" stroke={isSelected ? '#3b82f6' : '#38bdf8'} strokeWidth="1" />
                      <line x1={-o.width/2} y1={0} x2={o.width/2} y2={0} stroke={isSelected ? '#3b82f6' : '#38bdf8'} strokeWidth="1" />
                    </g>
                 )}
              </g>
            );
          })}
        </g>

        {/* Preview Line */}
        {activeTool === 'wall' && dragStart && (
           <g>
             <line x1={dragStart.x} y1={dragStart.y} x2={currentMouse.x} y2={currentMouse.y} stroke="#3b82f6" strokeWidth="20" opacity="0.3" />
             <text x={(dragStart.x+currentMouse.x)/2} y={(dragStart.y+currentMouse.y)/2-25} textAnchor="middle" fill="#60a5fa" fontSize="12" fontWeight="bold">
                {Math.round(Math.hypot(currentMouse.x-dragStart.x, currentMouse.y-dragStart.y))}
             </text>
           </g>
        )}
      </svg>
      
      <div className="absolute bottom-4 right-4 bg-zinc-900/80 backdrop-blur px-3 py-1 rounded text-xs font-mono text-zinc-500 border border-white/5 pointer-events-none uppercase tracking-widest">
         X: {currentMouse.x} Y: {currentMouse.y}
      </div>
    </div>
  );
};