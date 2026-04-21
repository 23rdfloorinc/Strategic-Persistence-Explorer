import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Strategy } from '../types';
import { Share2, Zap, Shield, Database, Crosshair, Terminal, X, Code, Download } from 'lucide-react';

interface LiveCanvasProps {
  strategies: Strategy[];
  onSelectStrategy: (strategy: Strategy | null) => void;
  selectedId: string | null;
}

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  strategy: Strategy;
}

const CATEGORY_ICONS: Record<string, any> = {
  Persistence: Database,
  Authentication: Shield,
  Infiltration: Crosshair,
  Redundancy: Zap,
};

const CATEGORY_COLORS: Record<string, string> = {
  Persistence: '#38bdf8', // sky-400
  Authentication: '#4ade80', // green-400
  Infiltration: '#f87171', // red-400
  Redundancy: '#fbbf24', // amber-400
};

const LiveCanvas: React.FC<LiveCanvasProps> = ({ strategies, onSelectStrategy, selectedId }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const requestRef = useRef<number>(null);

  // Initialize nodes
  useEffect(() => {
    if (!containerRef.current) return;
    
    const { offsetWidth: width, offsetHeight: height } = containerRef.current;
    setDimensions({ width, height });

    const newNodes: Node[] = strategies.map((s, i) => ({
      id: s.id,
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
      strategy: s,
    }));
    
    setNodes(newNodes);

    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [strategies]);

  // Simulation loop
  useEffect(() => {
    const animate = () => {
      setNodes((currentNodes) => {
        return currentNodes.map((node) => {
          let { x, y, vx, vy } = node;

          // Physics: Attraction to center
          const dx = dimensions.width / 2 - x;
          const dy = dimensions.height / 2 - y;
          vx += dx * 0.0001;
          vy += dy * 0.0001;

          // Physics: Repulsion from other nodes
          currentNodes.forEach((other) => {
            if (other.id === node.id) return;
            const distDx = other.x - x;
            const distDy = other.y - y;
            const distance = Math.sqrt(distDx * distDx + distDy * distDy) || 1;
            if (distance < 200) {
              const force = (200 - distance) * 0.0005;
              vx -= (distDx / distance) * force;
              vy -= (distDy / distance) * force;
            }
          });

          // Physics: Attraction between connected nodes
          node.strategy.connections.forEach((connId) => {
            const connectedNode = currentNodes.find((n) => n.id === connId);
            if (connectedNode) {
              const distDx = connectedNode.x - x;
              const distDy = connectedNode.y - y;
              const distance = Math.sqrt(distDx * distDx + distDy * distDy) || 1;
              const force = distance * 0.00005;
              vx += (distDx / distance) * force;
              vy += (distDy / distance) * force;
            }
          });

          // Dampening
          vx *= 0.98;
          vy *= 0.98;

          // Bound check
          x += vx;
          y += vy;
          
          if (x < 50) vx += 0.5;
          if (x > dimensions.width - 50) vx -= 0.5;
          if (y < 50) vy += 0.5;
          if (y > dimensions.height - 50) vy -= 0.5;

          return { ...node, x, y, vx, vy };
        });
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    if (dimensions.width > 0) {
      requestRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [dimensions]);

  // Draw lines on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    
    // Draw connections
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.1)'; // slate-400 with low opacity
    ctx.lineWidth = 1;
    
    nodes.forEach((node) => {
      node.strategy.connections.forEach((connId) => {
        const other = nodes.find((n) => n.id === connId);
        if (other) {
          const isFromSelected = selectedId === node.id;
          const isToSelected = selectedId === other.id;
          const isPrimarySelected = isFromSelected || isToSelected;
          
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          
          if (isPrimarySelected) {
            const time = Date.now() / 200;
            const pulse = (Math.sin(time) + 1) / 2;
            // Primary pulse for direct connections from selected node
            ctx.strokeStyle = `rgba(56, 189, 248, ${0.7 + pulse * 0.3})`;
            ctx.lineWidth = 4 + pulse * 4;
            ctx.shadowBlur = 20 + pulse * 20;
            ctx.shadowColor = '#38bdf8';
          } else if (selectedId) {
            // Secondary highlight or dimming for other connections when something is selected
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.02)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
          } else {
            // Default state
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.05)';
            ctx.lineWidth = 1;
            ctx.shadowBlur = 0;
          }
          
          ctx.stroke();
          ctx.shadowBlur = 0; // Reset for next iteration
        }
      });
    });
  }, [nodes, selectedId, dimensions]);

  const handleExportJSON = () => {
    const exportData = nodes.map(node => ({
      id: node.id,
      title: node.strategy.title,
      position: { x: node.x.toFixed(2), y: node.y.toFixed(2) },
      connections: node.strategy.connections
    }));

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system_topology_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[600px] bg-slate-950 rounded-xl border border-slate-800 overflow-hidden group mb-8"
      id="live-canvas-container"
    >
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs text-sky-400 font-mono shadow-lg">
          <Terminal size={14} />
          SYSTEM_TOPOLOGY_ACTIVE
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-slate-700 text-xs text-slate-400 font-mono shadow-lg">
          <Share2 size={14} />
          {nodes.length} PERSISTENT_NODES_LOCALIZED
        </div>
        
        <button 
          onClick={handleExportJSON}
          className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 backdrop-blur-md px-3 py-1.5 rounded-full border border-sky-500/30 text-xs text-sky-400 font-mono shadow-lg transition-all duration-300 group/btn mt-1"
        >
          <Download size={14} className="group-hover/btn:translate-y-0.5 transition-transform" />
          EXPORT_DATA_STREAM
        </button>
      </div>

      <canvas 
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="absolute inset-0 pointer-events-none"
      />

      <AnimatePresence>
        {nodes.map((node) => {
          const Icon = CATEGORY_ICONS[node.strategy.category] || Database;
          const color = CATEGORY_COLORS[node.strategy.category];
          const isSelected = selectedId === node.id;
          
          // Determine if this node is a direct neighbor of the selected node
          const isNeighbor = selectedId && (
            node.strategy.connections.includes(selectedId) || 
            nodes.find(n => n.id === selectedId)?.strategy.connections.includes(node.id)
          );

          const isDimmed = selectedId && !isSelected && !isNeighbor;

          return (
            <motion.div
              key={node.id}
              initial={false}
              animate={{
                x: node.x - 24,
                y: node.y - 24,
                scale: isSelected ? 1.2 : isNeighbor ? 1.1 : 1,
                zIndex: isSelected ? 50 : isNeighbor ? 40 : 10,
                opacity: isDimmed ? 0.3 : 1,
              }}
              className={`absolute cursor-pointer flex items-center justify-center`}
              onClick={() => onSelectStrategy(isSelected ? null : node.strategy)}
            >
              <div 
                className={`relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 ${
                  isSelected 
                    ? 'bg-sky-500 shadow-[0_0_20px_rgba(56,189,248,0.5)] border-2 border-white' 
                    : isNeighbor
                    ? 'bg-slate-800 shadow-[0_0_15px_rgba(255,255,255,0.2)] border-2 border-slate-400'
                    : 'bg-slate-900 border border-slate-700 hover:border-sky-500 hover:bg-slate-800'
                }`}
              >
                <Icon 
                  size={20} 
                  className={isSelected ? 'text-white' : ''} 
                  style={{ color: isSelected ? undefined : color }} 
                />
                
                {/* Node Label (shows on hover or if selected) */}
                <div 
                  className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-1 bg-slate-900/90 backdrop-blur-sm border border-slate-700 rounded text-[10px] uppercase font-mono tracking-wider transition-opacity duration-300 pointer-events-none ${
                    isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                  }`}
                  style={{ color: isSelected ? '#fff' : color }}
                >
                  {node.id}. {node.strategy.title.split(' ')[0]}...
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      <div className="absolute bottom-4 right-4 z-10 flex gap-4 text-[10px] font-mono uppercase">
        {Object.entries(CATEGORY_COLORS).map(([cat, col]) => (
          <div key={cat} className="flex items-center gap-1.5 text-slate-500">
            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: col }} />
            {cat}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LiveCanvas;
