import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getRelation, getGraph, validateGraph, getStats } from '../api/client';
import { 
  FlaskConical, 
  GitBranch, 
  Share2, 
  Layers, 
  RotateCw, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles,
  BookOpenCheck,
  Split,
  ChevronRight
} from 'lucide-react';

export default function AlgorithmsConcepts() {
  const [activeTab, setActiveTab] = useState<'poset' | 'dag' | 'cycle' | 'topo' | 'downset' | 'antichain'>('poset');

  const { data: relationData } = useQuery({ queryKey: ['relation'], queryFn: getRelation });
  const { data: graphData } = useQuery({ queryKey: ['graph'], queryFn: getGraph });
  const { data: validation } = useQuery({ queryKey: ['validate-graph'], queryFn: validateGraph });
  const { data: stats } = useQuery({ queryKey: ['stats'], queryFn: getStats });

  const concepts = [
    {
      id: 'poset',
      title: '1. Partially Ordered Set (Poset)',
      icon: Layers,
      color: 'from-red-700 to-red-950',
      badge: 'Relation Theory',
      tagline: 'Formal order relation where some course elements precede others',
      summary: 'A Poset (C, ≤) models course dependencies. Course a ≤ Course b means course a must be completed before course b.',
      mathFormula: 'R ⊆ C × C,   (a, b) ∈ R  ⇔  a is a prerequisite of b',
      properties: [
        { name: 'Irreflexive', desc: 'A course cannot be its own prerequisite: ∀ a ∈ C, (a, a) ∉ R' },
        { name: 'Asymmetric', desc: 'If (a, b) ∈ R, then (b, a) ∉ R' },
        { name: 'Transitive', desc: 'If (a, b) ∈ R and (b, c) ∈ R, then (a, c) ∈ R' },
      ]
    },
    {
      id: 'dag',
      title: '2. Directed Acyclic Graph (DAG)',
      icon: GitBranch,
      color: 'from-red-800 to-black',
      badge: 'Graph Theory',
      tagline: 'A directed graph containing no directed cycles',
      summary: 'Represented as G = (V, E) where V is the set of courses and E is the set of directed prerequisite edges.',
      mathFormula: 'G = (V, E),   V = {Set of Courses},   E = { (u, v) ∣ u precedes v }',
      properties: [
        { name: 'In-Degree', desc: 'in-deg(v) = |{ u ∈ V ∣ (u, v) ∈ E }|  (Direct prerequisites required)' },
        { name: 'Out-Degree', desc: 'out-deg(u) = |{ v ∈ V ∣ (u, v) ∈ E }|  (Direct dependent courses unlocked)' },
        { name: 'Minimal Elements', desc: '{ v ∈ V ∣ in-deg(v) = 0 }  (Entry-level courses with zero prerequisites)' },
      ]
    },
    {
      id: 'cycle',
      title: '3. Cycle Detection (DFS 3-Coloring)',
      icon: RotateCw,
      color: 'from-red-900 to-red-600',
      badge: 'Graph Verification',
      tagline: 'Detecting circular dependency deadlocks using vertex coloring',
      summary: 'Depth-First Search (DFS) tags vertices with 3 states to spot back-edges that violate poset asymmetry.',
      mathFormula: 'Cycle Detected  ⇔  ∃ (u, v) ∈ E  such that  color[v] = GRAY',
      properties: [
        { name: 'WHITE (0)', desc: 'Undiscovered vertex — not yet visited during DFS traversal' },
        { name: 'GRAY (1)', desc: 'Active vertex — currently in the active DFS recursion stack' },
        { name: 'BLACK (2)', desc: 'Completed vertex — all descendant paths fully processed' },
      ]
    },
    {
      id: 'topo',
      title: '4. Topological Ordering (Kahn\'s Algorithm)',
      icon: ArrowRight,
      color: 'from-red-700 to-dark-900',
      badge: 'Linearization',
      tagline: 'Linear extension sequence of a partial order',
      summary: 'Computes a total order L of vertices such that for every directed edge (u, v), u appears before v.',
      mathFormula: 'Linear Order L:  ∀ (u, v) ∈ E,   L(u) < L(v)',
      properties: [
        { name: 'Queue Init', desc: 'Initialize queue Q = { v ∈ V ∣ in-deg(v) = 0 }' },
        { name: 'Edge Reduction', desc: 'Dequeue u, add to L, decrement in-deg(v) for all (u, v) ∈ E' },
        { name: 'DAG Validation', desc: '|L| = |V|  ⇔  G is a valid DAG (no cycles exist)' },
      ]
    },
    {
      id: 'downset',
      title: '5. Downsets & Upsets (Order Ideals)',
      icon: Split,
      color: 'from-red-950 to-red-800',
      badge: 'Poset Ideals',
      tagline: 'Transitive ancestor chains and descendant impacts',
      summary: 'Computes order ideals (downsets) for prerequisite prerequisites and order filters (upsets) for dependent courses.',
      mathFormula: '↓(c) = { x ∈ C ∣ x ≤ c },     ↑(c) = { x ∈ C ∣ c ≤ x }',
      properties: [
        { name: 'Downset ↓(c)', desc: 'Complete historical transitive chain of prerequisites required for course c' },
        { name: 'Upset ↑(c)', desc: 'All future advanced courses unlocked once course c is completed' },
        { name: 'Order Ideal Condition', desc: 'If c is completed, all courses in ↓(c) must also be completed' },
      ]
    },
    {
      id: 'antichain',
      title: '6. Antichains & Semester Partitioning',
      icon: BookOpenCheck,
      color: 'from-dark-900 to-red-900',
      badge: 'Dilworth\'s Theorem',
      tagline: 'Partitioning posets into parallel independent subsets',
      summary: 'An antichain is a subset of courses with no prerequisite relationships between each other, allowing parallel enrollment.',
      mathFormula: 'A ⊆ C is an Antichain  ⇔  ∀ x, y ∈ A,   x ≰ y  and  y ≰ x',
      properties: [
        { name: 'Antichain Width', desc: 'Maximum number of courses that can be taken in parallel in 1 semester' },
        { name: 'DAG Leveling', desc: 'level(v) = max { level(u) + 1 ∣ (u, v) ∈ E },  with level(source) = 0' },
        { name: 'Semester Cover', desc: 'Semester S_k = { v ∈ V ∣ level(v) = k }, split if total credits > max_credits' },
      ]
    },
  ];

  const currentConcept = concepts.find(c => c.id === activeTab)!;

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-6 bg-red-600 inline-block" />
          <FlaskConical className="w-6 h-6 text-red-500" />
          Discrete Mathematics Explorer
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Formal mathematical foundations and backend graph algorithms</p>
      </div>

      {/* System Metrics Banner */}
      <div className="bg-dark-800 border border-red-900/40 p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4 border-b border-dark-600 pb-3">
          <Sparkles className="w-4 h-4 text-red-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">Live Backend Poset Metrics</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-dark-900 p-4 border border-red-900/30">
            <p className="text-xs text-slate-500 font-bold uppercase">Ground Set |V|</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">{graphData?.nodes?.length ?? 0} Courses</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Ground set C</p>
          </div>
          <div className="bg-dark-900 p-4 border border-red-900/30">
            <p className="text-xs text-slate-500 font-bold uppercase">Relation Set |R|</p>
            <p className="text-2xl font-bold text-red-400 font-mono mt-1">{relationData?.cardinality ?? 0} Pairs</p>
            <p className="text-xs text-slate-400 font-mono mt-1">Ordered pairs (a, b) ∈ R</p>
          </div>
          <div className="bg-dark-900 p-4 border border-red-900/30">
            <p className="text-xs text-slate-500 font-bold uppercase">Strict Partial Order</p>
            <p className={`text-2xl font-bold font-mono mt-1 flex items-center gap-1.5 ${validation?.valid ? 'text-red-400' : 'text-red-600'}`}>
              {validation?.valid ? <CheckCircle2 className="w-5 h-5 text-red-500" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
              {validation?.valid ? 'Valid DAG' : 'Cycle Detected'}
            </p>
            <p className="text-xs text-slate-400 font-mono mt-1">Irreflexive & Asymmetric</p>
          </div>
          <div className="bg-dark-900 p-4 border border-red-900/30">
            <p className="text-xs text-slate-500 font-bold uppercase">Minimal Elements</p>
            <p className="text-2xl font-bold text-red-500 font-mono mt-1">{stats?.available_courses ?? 0} Courses</p>
            <p className="text-xs text-slate-400 font-mono mt-1">in-deg(v) = 0</p>
          </div>
        </div>
      </div>

      {/* Concept Tabs Navigation */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {concepts.map((c) => {
          const Icon = c.icon;
          const isActive = activeTab === c.id;
          return (
            <button
              key={c.id}
              onClick={() => setActiveTab(c.id as any)}
              className={`p-3.5 border text-left transition-all duration-200 flex flex-col justify-between ${
                isActive
                  ? 'bg-red-950 border-red-600 text-white'
                  : 'bg-dark-800 border-red-900/30 text-slate-400 hover:bg-dark-900 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Icon className={`w-5 h-5 ${isActive ? 'text-red-500' : 'text-slate-500'}`} />
                {isActive && <div className="w-2 h-2 bg-red-600" />}
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider truncate">{c.title.split('.')[1]}</p>
                <p className="text-[10px] font-mono text-red-400/80 truncate mt-0.5">{c.badge}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Detailed Concept Breakdown Card */}
      <div className="bg-dark-800 border border-red-900/40 p-7 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-dark-600 pb-5">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 bg-gradient-to-br ${currentConcept.color} flex items-center justify-center border border-red-500/40`}>
              <currentConcept.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 bg-red-950 text-red-400 border border-red-700/60 uppercase">
                {currentConcept.badge}
              </span>
              <h2 className="text-xl font-bold text-white uppercase tracking-wider mt-1">{currentConcept.title}</h2>
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed font-sans">{currentConcept.summary}</p>

        {/* Mathematical Notation Box */}
        <div className="bg-dark-900 p-5 border border-red-900/50">
          <p className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Formal Mathematical Notation</p>
          <div className="font-mono text-base font-bold text-red-300 bg-black p-4 border border-red-900/60 overflow-x-auto tracking-wide">
            {currentConcept.mathFormula}
          </div>
        </div>

        {/* Concept Properties Grid */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Key Mathematical Properties</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {currentConcept.properties.map((prop, i) => (
              <div key={i} className="bg-dark-900 p-4 border border-red-900/30">
                <div className="flex items-center gap-2 mb-1.5">
                  <ChevronRight className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-white uppercase">{prop.name}</span>
                </div>
                <p className="text-xs font-mono text-slate-400 leading-normal">{prop.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Application Data Demonstration */}
        {activeTab === 'poset' && relationData && (
          <div className="bg-dark-900 p-5 border border-red-900/40">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <Share2 className="w-4 h-4 text-red-500" />
              Live Relation Pairs R ⊂ C × C ({relationData.cardinality} Total Edges)
            </h3>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
              {relationData.relation.map((pair, i) => (
                <div key={i} className="px-3 py-1.5 bg-black border border-red-900/60 text-xs font-mono text-red-400 flex items-center gap-1.5">
                  <span className="text-white font-bold">{pair.from_course.code}</span>
                  <span className="text-red-600">→</span>
                  <span className="text-red-400 font-bold">{pair.to_course.code}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'topo' && validation?.topological_order && (
          <div className="bg-dark-900 p-5 border border-red-900/40">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-red-500" />
              Live Linear Extension Sequence (Kahn's Topological Sort)
            </h3>
            <div className="flex flex-wrap items-center gap-2">
              {validation.topological_order.map((c, i) => (
                <div key={c.id} className="flex items-center gap-2">
                  <div className="px-3 py-1.5 bg-red-950 border border-red-700 text-xs font-mono text-red-400 font-bold">
                    {i + 1}. {c.code}
                  </div>
                  {i < validation.topological_order.length - 1 && <span className="text-red-600 text-xs font-mono font-bold">→</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
