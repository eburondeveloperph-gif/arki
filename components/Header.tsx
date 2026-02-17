/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import { Ruler, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="w-full py-4 px-6 border-b border-white/10 bg-zinc-900/80 backdrop-blur-md flex-shrink-0 z-50">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-lg shadow-blue-500/20">
            <Ruler className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight leading-none">Arki</h1>
            <p className="text-[10px] text-zinc-400 font-medium flex items-center gap-1">
              AI Architect <Sparkles className="w-2.5 h-2.5 text-amber-400" />
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-zinc-500">
          <div className="hidden sm:block px-2 py-1 bg-zinc-800/50 rounded border border-white/5">
            Scale: 1:50
          </div>
          <div className="hidden sm:block px-2 py-1 bg-zinc-800/50 rounded border border-white/5">
             Unit: mm
          </div>
        </div>
      </div>
    </header>
  );
};