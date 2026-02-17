/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React, { useState } from 'react';
import { Header } from './components/Header';
import { InputSection } from './components/InputSection';
import { EditorCanvas } from './components/EditorCanvas';
import { Toolbar } from './components/Toolbar';
import { generateFloorPlan } from './services/geminiService';
import { FloorPlan, GenerationStatus, ApiError, ToolType } from './types';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>(GenerationStatus.IDLE);
  const [activeTool, setActiveTool] = useState<ToolType>('wall');
  const [plan, setPlan] = useState<FloorPlan>({
    id: 'default',
    walls: [],
    openings: [],
    timestamp: Date.now()
  });
  const [error, setError] = useState<ApiError | null>(null);

  const handleGenerate = async (prompt: string) => {
    setStatus(GenerationStatus.LOADING);
    setError(null);

    try {
      const generatedPlan = await generateFloorPlan(prompt);
      setPlan(generatedPlan);
      setStatus(GenerationStatus.SUCCESS);
    } catch (err: any) {
      setStatus(GenerationStatus.ERROR);
      setError({
        message: "Architect Generation Failed",
        details: err.message || "An unexpected error occurred while contacting the architect service."
      });
      // Reset after error so user can continue editing manual
      setTimeout(() => setStatus(GenerationStatus.IDLE), 5000);
    }
  };

  const handleExport = () => {
     // Simple SVG export by grabbing the inner HTML of the canvas
     const svgEl = document.querySelector('svg');
     if (!svgEl) return;
     const serializer = new XMLSerializer();
     const source = serializer.serializeToString(svgEl);
     const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
     const url = URL.createObjectURL(blob);
     const link = document.createElement('a');
     link.href = url;
     link.download = `arki-plan-${plan.name || 'untitled'}.svg`;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 font-sans flex flex-col overflow-hidden">      
      <Header />
      
      <main className="flex-1 relative flex">
        <Toolbar 
          activeTool={activeTool} 
          onToolChange={setActiveTool} 
          onClear={() => setPlan({ ...plan, walls: [], openings: [] })}
          onExport={handleExport}
          hasItems={plan.walls.length > 0}
        />

        <EditorCanvas 
          plan={plan}
          activeTool={activeTool}
          onUpdatePlan={setPlan}
        />

        <InputSection onGenerate={handleGenerate} status={status} />
        
        {status === GenerationStatus.ERROR && error && (
          <div className="absolute top-4 right-4 max-w-sm z-50 animate-fade-in">
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3 text-red-200 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-red-400">{error.message}</h4>
                <p className="text-xs text-red-300/70 mt-1">{error.details}</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;