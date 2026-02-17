/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { FloorPlan, Wall, Opening, Fixture } from '../types';
import { Table, Info, Settings, Layout, X } from 'lucide-react';

interface SidebarProps {
  plan: FloorPlan;
  selectedId: string | null;
  onUpdatePlan: (plan: FloorPlan) => void;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ plan, selectedId, onUpdatePlan, onClose }) => {
  const selectedItem = 
    plan.walls.find(w => w.id === selectedId) || 
    plan.openings.find(o => o.id === selectedId) || 
    plan.fixtures.find(f => f.id === selectedId);

  const totalWallLength = plan.walls.reduce((acc, w) => acc + Math.hypot(w.end.x - w.start.x, w.end.y - w.start.y), 0);
  const doorCount = plan.openings.filter(o => o.type === 'door').length;
  const windowCount = plan.openings.filter(o => o.type === 'window').length;

  const updateSelectedProperty = (key: string, value: any) => {
    if (!selectedId || !selectedItem) return;

    const newPlan = { ...plan };
    if ('start' in selectedItem) { // Wall
      newPlan.walls = plan.walls.map(w => w.id === selectedId ? { ...w, [key]: value } : w);
    } else if ('wallId' in selectedItem) { // Opening
      newPlan.openings = plan.openings.map(o => o.id === selectedId ? { ...o, [key]: value } : o);
    } else if ('pos' in selectedItem) { // Fixture
      newPlan.fixtures = plan.fixtures.map(f => f.id === selectedId ? { ...f, [key]: value } : f);
    }
    onUpdatePlan(newPlan);
  };

  return (
    <aside className="w-80 border-l border-white/10 bg-zinc-900/50 backdrop-blur-xl flex flex-col animate-fade-in z-40 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-zinc-900/80">
        <h2 className="text-sm font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-2">
          {selectedId ? <Settings className="w-4 h-4 text-blue-400" /> : <Layout className="w-4 h-4 text-zinc-500" />}
          {selectedId ? 'Inspector' : 'Project Info'}
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-md transition-colors">
          <X className="w-4 h-4 text-zinc-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {selectedItem ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Object ID</label>
              <div className="px-3 py-2 bg-zinc-950/50 border border-white/5 rounded text-xs font-mono text-zinc-400 truncate">
                {selectedItem.id}
              </div>
            </div>

            {'thickness' in selectedItem && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Wall Thickness (mm)</label>
                <input 
                  type="number" 
                  value={(selectedItem as Wall).thickness} 
                  onChange={(e) => updateSelectedProperty('thickness', Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {'width' in selectedItem && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Width (mm)</label>
                <input 
                  type="number" 
                  value={(selectedItem as (Opening | Fixture)).width} 
                  onChange={(e) => updateSelectedProperty('width', Number(e.target.value))}
                  className="w-full bg-zinc-950 border border-white/10 rounded px-3 py-2 text-sm text-white focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {'rotation' in selectedItem && (
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rotation (deg)</label>
                <input 
                  type="range" min="0" max="360" step="15"
                  value={(selectedItem as Fixture).rotation} 
                  onChange={(e) => updateSelectedProperty('rotation', Number(e.target.value))}
                  className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <div className="text-[10px] text-zinc-500 text-right">{(selectedItem as Fixture).rotation}°</div>
              </div>
            )}
          </div>
        ) : (
          <>
            <section className="space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
                <Info className="w-3.5 h-3.5 text-blue-400" /> Statistics
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-zinc-950/50 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase">Total Walls</div>
                  <div className="text-lg font-mono text-white">{(totalWallLength/100).toFixed(1)}<span className="text-[10px] ml-1 text-zinc-400">m</span></div>
                </div>
                <div className="bg-zinc-950/50 p-3 rounded-lg border border-white/5">
                  <div className="text-[10px] font-bold text-zinc-500 uppercase">Est. Area</div>
                  <div className="text-lg font-mono text-white">~{(totalWallLength * 0.05).toFixed(0)}<span className="text-[10px] ml-1 text-zinc-400">m²</span></div>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
                <Table className="w-3.5 h-3.5 text-amber-400" /> Opening Schedule
              </h3>
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] p-2 bg-zinc-800/30 rounded border border-white/5">
                  <span className="text-zinc-400 uppercase tracking-widest">Type</span>
                  <span className="text-zinc-400 uppercase tracking-widest">Count</span>
                </div>
                <div className="flex justify-between text-xs px-2 py-1.5 border-b border-white/5">
                  <span className="text-zinc-300">Doors</span>
                  <span className="text-zinc-100 font-mono">{doorCount}</span>
                </div>
                <div className="flex justify-between text-xs px-2 py-1.5 border-b border-white/5">
                  <span className="text-zinc-300">Windows</span>
                  <span className="text-zinc-100 font-mono">{windowCount}</span>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <h3 className="text-xs font-bold text-white flex items-center gap-2 uppercase tracking-tighter">
                <Layout className="w-3.5 h-3.5 text-emerald-400" /> Legend
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {plan.fixtures.length > 0 ? (
                  Array.from(new Set(plan.fixtures.map(f => f.type))).map(type => (
                    <div key={type} className="flex items-center gap-3 p-2 bg-zinc-950/30 rounded-lg border border-white/5 capitalize text-xs text-zinc-400">
                      <div className="w-8 h-8 bg-zinc-800 flex items-center justify-center rounded border border-white/10 text-zinc-200">
                         {type[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="font-bold text-zinc-200">{type}</div>
                        <div className="text-[10px]">Symbol Standard A1</div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-[10px] text-zinc-600 italic">No fixtures placed yet.</div>
                )}
              </div>
            </section>
          </>
        )}
      </div>

      <div className="p-4 border-t border-white/10 bg-zinc-950/50">
        <p className="text-[10px] text-zinc-500 leading-relaxed uppercase tracking-tighter text-center">
          Arki Professional v1.0 • Blueprint Standard ISO-800
        </p>
      </div>
    </aside>
  );
};