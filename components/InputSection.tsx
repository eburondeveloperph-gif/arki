/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState, useCallback } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { GenerationStatus } from '../types';

interface InputSectionProps {
  onGenerate: (prompt: string) => void;
  status: GenerationStatus;
}

export const InputSection: React.FC<InputSectionProps> = ({ onGenerate, status }) => {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && status !== GenerationStatus.LOADING) {
      onGenerate(input.trim());
    }
  }, [input, status, onGenerate]);

  const isLoading = status === GenerationStatus.LOADING;

  return (
    <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 z-40 transition-all duration-500 ${isExpanded ? 'translate-y-0' : 'translate-y-[120%]'}`}>
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 rounded-2xl opacity-20 group-hover:opacity-40 transition duration-500 blur-lg"></div>
        <div className="relative flex items-center bg-zinc-900/90 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden p-2">
          <div className="pl-4 text-cyan-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Describe a layout: e.g., 'A 2-bedroom apartment with an open kitchen...'"
            className="flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 px-4 py-3 text-base"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className={`
              flex items-center justify-center w-10 h-10 rounded-lg font-semibold transition-all duration-200
              ${!input.trim() || isLoading 
                ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' 
                : 'bg-white text-zinc-950 hover:bg-zinc-200 active:scale-95 shadow-lg shadow-white/10'}
            `}
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </form>
      
      {/* Quick suggestions */}
      {!isLoading && (
        <div className="mt-2 flex flex-wrap justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {['1-Bedroom Studio', 'Small Office Layout', 'L-Shaped Living Room'].map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="px-2 py-1 text-[10px] font-medium text-zinc-400 bg-zinc-900/80 border border-white/5 rounded-full hover:bg-zinc-800 hover:text-white hover:border-white/20 transition-all backdrop-blur-sm"
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};