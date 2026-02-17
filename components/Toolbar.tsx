/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { MousePointer2, PencilLine, DoorOpen, Square, Download, Trash2, Sofa } from 'lucide-react';
import { ToolType } from '../types';

interface ToolbarProps {
  activeTool: ToolType;
  onToolChange: (tool: ToolType) => void;
  onClear: () => void;
  onExport: () => void;
  hasItems: boolean;
}

export const Toolbar: React.FC<ToolbarProps> = ({ activeTool, onToolChange, onClear, onExport, hasItems }) => {
  const tools: { id: ToolType; icon: React.ReactNode; label: string }[] = [
    { id: 'select', icon: <MousePointer2 className="w-5 h-5" />, label: 'Select' },
    { id: 'wall', icon: <PencilLine className="w-5 h-5" />, label: 'Wall Tool' },
    { id: 'door', icon: <DoorOpen className="w-5 h-5" />, label: 'Door Tool' },
    { id: 'window', icon: <Square className="w-5 h-5" />, label: 'Window Tool' },
    { id: 'fixture', icon: <Sofa className="w-5 h-5" />, label: 'Library / Fixtures' },
  ];

  return (
    <div className="absolute top-20 left-4 flex flex-col gap-2 z-40">
      <div className="bg-zinc-900/90 backdrop-blur-md border border-white/10 rounded-xl p-2 shadow-xl flex flex-col gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onToolChange(tool.id)}
            className={`
              p-3 rounded-lg transition-all duration-200 group relative
              ${activeTool === tool.id 
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'}
            `}
            title={tool.label}
          >
            {tool.icon}
            <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
              {tool.label}
            </div>
          </button>
        ))}
        
        <div className="h-px bg-white/10 my-2 mx-2" />

        <button
          onClick={onExport}
          disabled={!hasItems}
          className="p-3 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
        >
          <Download className="w-5 h-5" />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Export Drawing
          </div>
        </button>

        <button
          onClick={onClear}
          disabled={!hasItems}
          className="p-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed group relative"
        >
          <Trash2 className="w-5 h-5" />
          <div className="absolute left-full ml-3 px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[10px] font-bold uppercase tracking-wider text-white opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
            Wipe Plan
          </div>
        </button>
      </div>
    </div>
  );
};