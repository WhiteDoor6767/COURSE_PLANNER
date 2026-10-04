import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { GitBranch, Plus, Trash2, ChevronDown, ArrowRight, ArrowDown } from 'lucide-react';
import { getCourses, getPrerequisites, addPrerequisite, removePrerequisite, getPrerequisiteChain, getDependents } from '../api/client';

export default function PrerequisiteManager() {
  const qc = useQueryClient();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [addPrereqId, setAddPrereqId] = useState<string>('');
  const [tab, setTab] = useState<'direct'|'chain'|'dependents'>('direct');
  const { data: courses = [] } = useQuery({ queryKey: ['courses'], queryFn: getCourses });
  const selectedCourse = courses.find(c => c.id === selectedId);
  const { data: prereqs = [] } = useQuery({ queryKey: ['prereqs', selectedId], queryFn: () => getPrerequisites(selectedId!), enabled: selectedId !== null });
  const { data: chainData } = useQuery({ queryKey: ['chain', selectedId], queryFn: () => getPrerequisiteChain(selectedId!), enabled: selectedId !== null && tab === 'chain' });
  const { data: dependentsData } = useQuery({ queryKey: ['dependents', selectedId], queryFn: () => getDependents(selectedId!), enabled: selectedId !== null && tab === 'dependents' });
  const inv = () => { qc.invalidateQueries({ queryKey: ['prereqs', selectedId] }); qc.invalidateQueries({ queryKey: ['chain', selectedId] }); qc.invalidateQueries({ queryKey: ['validate-graph'] }); qc.invalidateQueries({ queryKey: ['stats'] }); };
  const addMut = useMutation({
    mutationFn: () => addPrerequisite(selectedId!, Number(addPrereqId)),
    onSuccess: () => { toast.success('Prerequisite added!'); setAddPrereqId(''); inv(); },
    onError: (e: any) => { const d = e.response?.data?.detail; toast.error(typeof d === 'object' ? d.message : d || 'Failed'); },
  });
  const removeMut = useMutation({ mutationFn: (pid: number) => removePrerequisite(selectedId!, pid), onSuccess: () => { toast.success('Removed'); inv(); } });
  const prereqIds = new Set(prereqs.map(p => p.id));
  const available = courses.filter(c => c.id !== selectedId && !prereqIds.has(c.id));
  const TabBtn = ({ value, label }: { value: typeof tab; label: string }) => (
    <button onClick={() => setTab(value)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border ${tab === value ? 'bg-red-950 text-red-400 border-red-600' : 'bg-dark-800 text-slate-400 border-dark-600 hover:text-white'}`}>{label}</button>
  );
  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-6 bg-red-600 inline-block" />
          Prerequisite Manager
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">Configure prerequisite links in the partial order</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <div className="bg-dark-800 border border-red-900/40 p-4">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Select Target Course</h2>
            <div className="space-y-1 max-h-[300px] sm:max-h-[460px] overflow-y-auto pr-1">
              {courses.map(course => (
                <button key={course.id} onClick={() => { setSelectedId(course.id); setTab('direct'); setAddPrereqId(''); }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all border ${selectedId === course.id ? 'bg-red-950 border-red-600 text-red-400' : 'bg-dark-900 border-dark-600 text-slate-400 hover:text-white hover:bg-dark-800'}`}>
                  <div className="min-w-0"><p className="text-xs font-mono font-bold">{course.code}</p><p className="text-xs truncate mt-0.5 opacity-70">{course.name}</p></div>
                  {course.completed && <span className="ml-auto text-red-500 font-bold text-xs">✓</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="lg:col-span-2 space-y-4">
          {!selectedCourse ? (
            <div className="bg-dark-800 border border-red-900/40 p-8 sm:p-12 flex flex-col items-center justify-center text-center h-full">
              <GitBranch className="w-10 h-10 text-red-700 mb-3" />
              <p className="text-slate-400 font-bold uppercase tracking-wider text-xs sm:text-sm">Select a course to edit prerequisites</p>
            </div>
          ) : (
            <>
              <div className="bg-dark-800 border border-red-900/40 p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div><span className="text-xs font-mono font-bold text-red-500">{selectedCourse.code}</span><h2 className="text-base sm:text-lg font-bold text-white uppercase mt-0.5">{selectedCourse.name}</h2><p className="text-xs font-mono text-slate-500 mt-1">{selectedCourse.credits} CREDITS</p></div>
                  {selectedCourse.completed && <span className="text-xs font-mono font-bold bg-red-950 text-red-400 border border-red-600 px-3 py-1 uppercase">Completed</span>}
                </div>
              </div>
              <div className="flex flex-wrap gap-2"><TabBtn value="direct" label="Direct Prerequisites" /><TabBtn value="chain" label="Full Downset Chain" /><TabBtn value="dependents" label="Upset Dependents" /></div>
              {tab === 'direct' && (
                <div className="bg-dark-800 border border-red-900/40 p-4 sm:p-5 space-y-4">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Add Direct Prerequisite for {selectedCourse.code}</h3>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <select value={addPrereqId} onChange={e => setAddPrereqId(e.target.value)} className="w-full bg-black border border-red-900/50 px-3 py-2.5 text-sm text-white focus:outline-none focus:border-red-600 appearance-none font-mono">
                        <option value="">Select a prerequisite course to add...</option>
                        {available.map(c => <option key={c.id} value={c.id}>{c.code} — {c.name}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-600 pointer-events-none" />
                    </div>
                    <button onClick={() => addPrereqId && addMut.mutate()} disabled={!addPrereqId || addMut.isPending} className="px-4 py-2.5 bg-red-700 hover:bg-red-600 disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 border border-red-500/40"><Plus className="w-4 h-4" />Add</button>
                  </div>
                  {prereqs.length === 0 ? <p className="text-slate-500 text-sm text-center py-6 font-mono">No direct prerequisites (Minimal Element)</p> : (
                    <div className="space-y-2">{prereqs.map(p => (
                      <div key={p.id} className="flex items-center gap-3 p-3 bg-dark-900 border border-red-900/40 group">
                        <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0"><span className="text-sm font-mono font-bold text-red-400">{p.code}</span><span className="text-sm text-slate-300 ml-2">{p.name}</span></div>
                        <span className="text-xs font-mono text-slate-500">{p.credits} CR</span>
                        <button onClick={() => removeMut.mutate(p.id)} disabled={removeMut.isPending} className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950 transition-all border border-transparent hover:border-red-900"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}</div>
                  )}
                </div>
              )}
              {tab === 'chain' && (
                <div className="bg-dark-800 border border-red-900/40 p-5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Transitive Prerequisite Downset ↓({selectedCourse.code})</h3>
                  {!chainData || chainData.chain.length === 0 ? <p className="text-slate-500 text-sm text-center py-6 font-mono">No prerequisites required</p> : (
                    <div className="space-y-2">
                      {chainData.chain.map((c, i) => (
                        <div key={c.id}>
                          <div className={`flex items-center gap-3 p-3 border ${c.completed ? 'bg-red-950/60 border-red-600' : 'bg-dark-900 border-dark-600'}`}>
                            <span className="w-5 h-5 bg-black border border-red-900 text-xs font-mono text-red-400 flex items-center justify-center flex-shrink-0">{i+1}</span>
                            <span className="font-mono text-sm font-bold text-red-400">{c.code}</span>
                            <span className="text-sm text-slate-300">{c.name}</span>
                            {c.completed && <span className="ml-auto text-xs text-red-500 font-bold">✓</span>}
                          </div>
                          {i < chainData.chain.length - 1 && <div className="flex justify-start ml-4 my-1"><ArrowDown className="w-3 h-3 text-red-600" /></div>}
                        </div>
                      ))}
                      <div className="flex justify-start ml-4 my-1"><ArrowDown className="w-3 h-3 text-red-600" /></div>
                      <div className="flex items-center gap-3 p-3 border bg-red-950 border-red-600">
                        <span className="font-mono text-sm font-bold text-white">{selectedCourse.code}</span>
                        <span className="text-sm text-red-200 font-bold">{selectedCourse.name}</span>
                        <span className="ml-auto text-xs bg-red-900 text-white font-mono px-2 py-0.5 border border-red-600">Target Course</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              {tab === 'dependents' && (
                <div className="bg-dark-800 border border-red-900/40 p-5">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4">Transitive Dependent Upset ↑({selectedCourse.code})</h3>
                  {!dependentsData || dependentsData.dependents.length === 0 ? <p className="text-slate-500 text-sm text-center py-6 font-mono">No courses depend on this course</p> : (
                    <div className="space-y-2">{dependentsData.dependents.map(dep => (
                      <div key={dep.id} className="flex items-center gap-3 p-3 bg-dark-900 border border-red-900/40">
                        <ArrowRight className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <span className="font-mono text-sm font-bold text-red-400">{dep.code}</span>
                        <span className="text-sm text-slate-300">{dep.name}</span>
                        <span className="ml-auto text-xs font-mono text-slate-500">{dep.credits} CR</span>
                      </div>
                    ))}</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
