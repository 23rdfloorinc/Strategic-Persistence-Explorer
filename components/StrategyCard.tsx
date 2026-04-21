
import React from 'react';
import { motion } from 'motion/react';
import { Strategy } from '../types';
import CodeBlock from './CodeBlock';
import { Database, Shield, Crosshair, Zap, ExternalLink, Terminal } from 'lucide-react';

interface StrategyCardProps {
  strategy: Strategy;
  isActive?: boolean;
}

const CATEGORY_ICONS: Record<string, any> = {
  Persistence: Database,
  Authentication: Shield,
  Infiltration: Crosshair,
  Redundancy: Zap,
};

const CATEGORY_COLORS: Record<string, string> = {
  Persistence: 'text-sky-400 border-sky-400/30 bg-sky-400/10',
  Authentication: 'text-green-400 border-green-400/30 bg-green-400/10',
  Infiltration: 'text-red-400 border-red-400/30 bg-red-400/10',
  Redundancy: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
};

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, isActive }) => {
  const Icon = CATEGORY_ICONS[strategy.category] || Database;
  const colorClass = CATEGORY_COLORS[strategy.category];

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative bg-slate-900 border ${isActive ? 'border-sky-500 shadow-[0_0_25px_rgba(56,189,248,0.15)]' : 'border-slate-800'} rounded-xl overflow-hidden group transition-all duration-300`}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/20">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${colorClass} border`}>
            <Icon size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-slate-500">ID://00{strategy.id}</span>
              <span className={`text-[10px] font-mono uppercase px-1.5 py-0.5 rounded border ${colorClass}`}>
                {strategy.category}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">{strategy.title}</h2>
          </div>
        </div>
        <button className="text-slate-500 hover:text-sky-400 transition-colors">
          <ExternalLink size={16} />
        </button>
      </div>
      
      <div className="p-5">
        <div className="flex gap-2 items-start mb-4">
          <Terminal size={14} className="text-sky-400 mt-1 flex-shrink-0" />
          <p className="text-slate-400 text-sm leading-relaxed font-mono">
            {strategy.concept}
          </p>
        </div>

        {/* Related Concepts Section */}
        <div className="mb-6 px-3 py-3 bg-slate-950/50 border border-slate-800 rounded-lg">
          <h4 className="text-[10px] font-mono text-sky-500/70 uppercase mb-2 flex items-center gap-1.5">
            <Database size={10} />
            Conceptual Nodes
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {strategy.concept.split(/[\s,.;]+/).filter(word => word.length > 5 && !['create', 'system', 'access', 'multiple', 'across', 'through', 'approach'].includes(word.toLowerCase())).slice(0, 4).map((keyword, idx) => (
              <span key={idx} className="px-1.5 py-0.5 bg-slate-800/50 border border-slate-700/50 rounded text-[9px] font-mono text-slate-500 lowercase">
                #{keyword.toLowerCase().replace(/[^a-z0-9]/g, '')}
              </span>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
            <span>Implementation Preview</span>
            <span>v1.0.4 r7</span>
          </div>
          <CodeBlock code={strategy.implementation} language={strategy.rawCodeLanguage} />
        </div>

        {strategy.connections.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-800">
            <h4 className="text-[10px] font-mono text-slate-500 uppercase mb-2">Relational Interlinks</h4>
            <div className="flex flex-wrap gap-2">
              {strategy.connections.map(connId => (
                <span key={connId} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[9px] font-mono text-slate-400">
                  REF::{connId.padStart(3, '0')}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default StrategyCard;
