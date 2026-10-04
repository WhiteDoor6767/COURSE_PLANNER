import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ReactFlow, Background, Controls, MiniMap, BackgroundVariant } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Network } from 'lucide-react';
import { getGraph } from '../api/client';

export default function GraphView() {
  const { data: graphData, isLoading } = useQuery({ queryKey: ['graph'], queryFn: getGraph });

  const { nodes, edges } = useMemo(() => {
    if (!graphData) return { nodes: [], edges: [] };
    const hasIncoming = new Set(graphData.edges.map(e => e.target));
    const nodes: Node[] = graphData.nodes.map((n, i) => {
      const isRoot = !hasIncoming.has(n.id);
      const color = n.completed
        ? { bg: '#450a0a', border: '#ef4444', text: '#f87171' }
        : isRoot
        ? { bg: '#181818', border: '#dc2626', text: '#ef4444' }
        : { bg: '#121212', border: '#7f1d1d', text: '#fca5a5' };
      const cols = Math.ceil(Math.sqrt(graphData.nodes.length));
      const row = Math.floor(i / cols);
      const col = i % cols;
      return {
        id: String(n.id),
        position: { x: col * 220 + (row % 2) * 60, y: row * 140 },
        data: {
          label: (
            <div className="text-center px-1">
              <div style={{ color: color.text }} className="font-mono font-bold text-xs">{n.code}</div>
              <div className="text-slate-200 text-xs mt-0.5">{n.name.length > 18 ? n.name.slice(0,18)+'...' : n.name}</div>
              <div className="text-slate-500 font-mono text-[10px] mt-0.5">{n.credits} CR</div>
            </div>
          ),
        },
        style: { background: color.bg, border: `2px solid ${color.border}`, borderRadius: '0px', padding: '10px 14px', width: 160, boxShadow: `0 0 15px ${color.border}40`, cursor: 'default' },
      };
    });
    const edges: Edge[] = graphData.edges.map((e, i) => ({
      id: `e${i}-${e.source}-${e.target}`,
      source: String(e.source),
      target: String(e.target),
      animated: true,
      style: { stroke: '#dc2626', strokeWidth: 2 },
      markerEnd: { type: 'arrowclosed' as any, color: '#dc2626', width: 16, height: 16 },
    }));
    return { nodes, edges };
  }, [graphData]);

  if (isLoading) return <div className="h-full flex items-center justify-center bg-black"><div className="text-red-500 font-mono">Loading directed graph...</div></div>;
  if (!graphData || graphData.nodes.length === 0) return <div className="h-full flex flex-col items-center justify-center gap-4 bg-black"><Network className="w-12 h-12 text-red-900" /><p className="text-slate-500 font-mono">No courses in ground set</p></div>;

  return (
    <div className="h-full flex flex-col bg-black">
      <div className="p-6 border-b border-red-900/40 flex items-center justify-between flex-shrink-0 bg-dark-900">
        <div>
          <h1 className="text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
            <span className="w-2 h-6 bg-red-600 inline-block" />
            Graph Visualization (DAG)
          </h1>
          <p className="text-slate-400 text-xs font-mono mt-1">{graphData.nodes.length} Vertices |V| · {graphData.edges.length} Edges |E|</p>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-600 border border-red-400" /><span className="text-slate-400">Minimal Element (No Prereqs)</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-dark-800 border border-red-900" /><span className="text-slate-400">Course Node</span></div>
          <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-950 border border-red-500" /><span className="text-slate-400">Completed</span></div>
        </div>
      </div>
      <div className="flex-1 bg-black">
        <ReactFlow nodes={nodes} edges={edges} fitView fitViewOptions={{ padding: 0.3 }} nodesDraggable={true} nodesConnectable={false} elementsSelectable={true} proOptions={{ hideAttribution: true }}>
          <Background variant={BackgroundVariant.Dots} gap={24} size={1} color="#450a0a" />
          <Controls />
          <MiniMap nodeColor={(n) => { const style = n.style as React.CSSProperties | undefined; const border = style?.border as string | undefined; return border ? border.replace('2px solid ','') : '#dc2626'; }} maskColor="rgba(0,0,0,0.85)" />
        </ReactFlow>
      </div>
    </div>
  );
}
