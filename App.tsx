import React, { useState, useMemo } from 'react';
import { STRATEGIES_DATA } from './constants';
import StrategyCard from './components/StrategyCard';
import LiveCanvas from './components/LiveCanvas';
import { Strategy } from './types';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { LayoutGrid, Share2, Activity, Cpu, ShieldCheck, Terminal, Filter, Move } from 'lucide-react';

const App: React.FC = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(STRATEGIES_DATA);
  const [viewMode, setViewMode] = useState<'list' | 'canvas'>('canvas');
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [filter, setFilter] = useState<string>('All');

  const categories = ['All', 'Persistence', 'Authentication', 'Infiltration', 'Redundancy'];

  const filteredStrategies = useMemo(() => {
    if (filter === 'All') return strategies;
    return strategies.filter(s => s.category === filter);
  }, [filter, strategies]);

  const handleReorder = (newFiltered: Strategy[]) => {
    if (filter === 'All') {
      setStrategies(newFiltered);
      return;
    }

    // Update the master list by replacing the slots of the filtered items
    const newStrategies = [...strategies];
    const filteredIds = new Set(filteredStrategies.map(s => s.id));
    let filteredPtr = 0;

    for (let i = 0; i < newStrategies.length; i++) {
      if (filteredIds.has(newStrategies[i].id)) {
        newStrategies[i] = newFiltered[filteredPtr];
        filteredPtr++;
      }
    }
    setStrategies(newStrategies);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-sky-500/30">
      {/* Top System Bar */}
      <div className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              SYSTEM_SECURE
            </div>
            <div className="hidden md:flex items-center gap-2">
              <Cpu size={12} />
              CPU_LOAD: 12.4%
            </div>
            <div className="hidden md:flex items-center gap-2">
              <ShieldCheck size={12} />
              ENCRYPTION: AES-256GCM
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">AUTH_PROTOCOL: {viewMode.toUpperCase()}</span>
            <span className="text-sky-400">SESSION_ACTIVE: {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      <header className="max-w-7xl mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
        >
          <p className="text-sm md:text-base font-bold uppercase mb-4 chrome-text tracking-[0.2em]">
            FROGULA LABS PRESENTS
          </p>
          <h1 className="text-5xl md:text-7xl metallic-title-main mb-6 leading-tight">
            STRATEGIC<br />PERSISTENCE
          </h1>
          <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto font-mono leading-relaxed">
            Advanced laboratory for analyzing persistent access methodologies and their interconnectivity.
          </p>
        </motion.div>

        {/* Controls */}
        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 border-y border-slate-800/50 py-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            <Filter size={14} className="text-slate-500 mr-2" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-3 py-1 rounded-full text-[10px] uppercase font-mono border transition-all ${
                  filter === cat 
                    ? 'bg-sky-500/10 border-sky-500 text-sky-400' 
                    : 'bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === 'list' ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <LayoutGrid size={14} />
              GRID_VIEW
            </button>
            <button
              onClick={() => setViewMode('canvas')}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-xs font-mono transition-all ${
                viewMode === 'canvas' ? 'bg-slate-800 text-sky-400' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Share2 size={14} />
              TOPOLOGY
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 pb-24">
        {viewMode === 'canvas' ? (
          <div className="space-y-8">
            <LiveCanvas 
              strategies={filteredStrategies} 
              onSelectStrategy={setSelectedStrategy}
              selectedId={selectedStrategy?.id || null}
            />
            
            <AnimatePresence mode="wait">
              {selectedStrategy ? (
                <motion.div
                  key={selectedStrategy.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="max-w-3xl mx-auto"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xs font-mono text-sky-400 uppercase tracking-widest flex items-center gap-2">
                       <Activity size={14} className="animate-pulse" />
                       NODE_DETECTION_POSITIVE
                    </h3>
                    <button 
                      onClick={() => setSelectedStrategy(null)}
                      className="text-slate-500 hover:text-white transition-colors"
                    >
                      CLEAR_SELECTION [X]
                    </button>
                  </div>
                  <StrategyCard strategy={selectedStrategy} isActive={true} />
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center py-12 border-2 border-dashed border-slate-800 rounded-xl"
                >
                  <Terminal size={32} className="mx-auto text-slate-800 mb-4" />
                  <p className="text-slate-600 font-mono text-sm uppercase">Select a node to inspect system metrics</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-mono text-slate-500 uppercase tracking-[0.3em] flex items-center gap-2">
                <Move size={12} className="text-sky-500" />
                DRAG_TO_REORGANIZE_DATA_STREAMS
              </h2>
              <span className="text-[10px] font-mono text-slate-700">TOTAL_ACTIVE: {filteredStrategies.length}</span>
            </div>

            <Reorder.Group 
              axis="y" 
              values={filteredStrategies} 
              onReorder={handleReorder}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {filteredStrategies.map((strategy) => (
                <Reorder.Item 
                  key={strategy.id} 
                  value={strategy}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="cursor-grab active:cursor-grabbing"
                >
                  <StrategyCard 
                    strategy={strategy} 
                    isActive={selectedStrategy?.id === strategy.id}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        )}
      </main>

      <footer className="text-center py-12 border-t border-slate-900 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-center gap-2 mb-4 text-sky-400">
            <Terminal size={18} />
            <span className="font-mono text-xs uppercase tracking-widest">Frogula Labs // R&D Dept</span>
          </div>
          <p className="text-[10px] text-slate-600 font-mono max-w-2xl mx-auto uppercase leading-loose">
            Disclaimer: The techniques described are for informational and educational purposes only. 
            Unauthorized access or persistence is illegal and unethical. All simulation data is isolated and non-executable.
            © 2026 FROGULA_CORP_GLOBAL
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
