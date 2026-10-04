import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { Plus, Pencil, Trash2, CheckCircle2, Circle, X, BookOpen, AlertCircle } from 'lucide-react';
import { getCourses, createCourse, updateCourse, deleteCourse, toggleComplete } from '../api/client';
import type { Course, CourseCreate } from '../types';

const EMPTY_FORM: CourseCreate = { code: '', name: '', credits: 3, description: '' };

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      <div className="relative bg-dark-900 border border-red-900/60 shadow-2xl w-full max-w-lg animate-slide-up" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

function CourseForm({ initial, onSubmit, onCancel, loading, title }: { initial: CourseCreate; onSubmit: (data: CourseCreate) => void; onCancel: () => void; loading: boolean; title: string }) {
  const [form, setForm] = useState<CourseCreate>(initial);
  const change = (field: keyof CourseCreate) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: field === 'credits' ? Number(e.target.value) : e.target.value }));
  const inputCls = 'w-full bg-black border border-red-900/50 px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-red-600 font-mono transition-colors';
  const labelCls = 'block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5';
  return (
    <form onSubmit={e => { e.preventDefault(); if (!form.code.trim() || !form.name.trim()) { toast.error('Code and name required'); return; } onSubmit(form); }} className="p-6 space-y-4">
      <div className="flex items-center justify-between border-b border-dark-600 pb-3 mb-2">
        <h3 className="text-lg font-bold text-white uppercase tracking-wide">{title}</h3>
        <button type="button" onClick={onCancel} className="p-1 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div><label className={labelCls}>Course Code *</label><input className={inputCls} placeholder="e.g. CS301" value={form.code} onChange={change('code')} maxLength={20} /></div>
        <div><label className={labelCls}>Credits</label><input type="number" min={1} max={12} className={inputCls} value={form.credits} onChange={change('credits')} /></div>
      </div>
      <div><label className={labelCls}>Course Name *</label><input className={inputCls} placeholder="e.g. Data Structures" value={form.name} onChange={change('name')} maxLength={200} /></div>
      <div><label className={labelCls}>Description</label><textarea className={`${inputCls} resize-none h-24`} placeholder="Brief description..." value={form.description} onChange={change('description')} /></div>
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-400 border border-dark-600 uppercase hover:bg-dark-800">Cancel</button>
        <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-700 hover:bg-red-600 disabled:opacity-50 uppercase tracking-wider">{loading ? 'Saving...' : 'Save Course'}</button>
      </div>
    </form>
  );
}

export default function CourseManager() {
  const qc = useQueryClient();
  const [showAdd, setShowAdd] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const { data: courses = [], isLoading } = useQuery({ queryKey: ['courses'], queryFn: getCourses });
  const inv = () => { qc.invalidateQueries({ queryKey: ['courses'] }); qc.invalidateQueries({ queryKey: ['stats'] }); qc.invalidateQueries({ queryKey: ['available-courses'] }); qc.invalidateQueries({ queryKey: ['validate-graph'] }); };
  const createMut = useMutation({ mutationFn: createCourse, onSuccess: () => { toast.success('Course created!'); setShowAdd(false); inv(); }, onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed') });
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: number; data: CourseCreate }) => updateCourse(id, data), onSuccess: () => { toast.success('Course updated!'); setEditCourse(null); inv(); }, onError: (e: any) => toast.error(e.response?.data?.detail || 'Failed') });
  const deleteMut = useMutation({ mutationFn: deleteCourse, onSuccess: () => { toast.success('Deleted'); setDeleteId(null); inv(); } });
  const completeMut = useMutation({ mutationFn: toggleComplete, onSuccess: (u) => { toast.success(u.completed ? `${u.code} completed!` : `${u.code} incomplete`); inv(); } });
  if (isLoading) return <div className="p-8 space-y-3">{[...Array(5)].map((_,i)=><div key={i} className="h-16 bg-dark-800 border border-dark-600 animate-pulse" />)}</div>;
  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
            <span className="w-2 h-6 bg-red-600 inline-block" />
            Course Manager
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">{courses.length} courses registered</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-3.5 py-2 sm:px-4 sm:py-2.5 bg-red-700 hover:bg-red-600 text-white text-xs sm:text-sm font-bold uppercase tracking-wider border border-red-500/40"><Plus className="w-4 h-4" />Add Course</button>
      </div>
      {courses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-dark-800 border border-red-900/30">
          <div className="w-16 h-16 bg-dark-900 border border-red-900/60 flex items-center justify-center mb-4"><BookOpen className="w-7 h-7 text-red-600" /></div>
          <p className="text-slate-400 font-bold uppercase tracking-wider">No courses registered</p>
          <p className="text-slate-600 text-sm mt-1">Add your first course to populate the poset</p>
        </div>
      ) : (
        <div className="bg-dark-800 border border-red-900/40 overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead><tr className="border-b border-red-900/40 bg-dark-900">
              <th className="text-left px-4 sm:px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 sm:px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Code</th>
              <th className="text-left px-4 sm:px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Name</th>
              <th className="text-left px-4 sm:px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Credits</th>
              <th className="text-right px-4 sm:px-5 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Actions</th>
            </tr></thead>
            <tbody className="divide-y divide-dark-600">
              {courses.map(course => (
                <tr key={course.id} className="hover:bg-dark-900/60 transition-colors group">
                  <td className="px-4 sm:px-5 py-3.5"><button onClick={() => completeMut.mutate(course.id)} className="text-slate-500 hover:text-red-500 transition-colors">{course.completed ? <CheckCircle2 className="w-5 h-5 text-red-500" /> : <Circle className="w-5 h-5 text-slate-600" opacity={1} />}</button></td>
                  <td className="px-4 sm:px-5 py-3.5"><span className="font-mono text-sm font-bold text-red-400">{course.code}</span></td>
                  <td className="px-4 sm:px-5 py-3.5"><div><p className={`text-sm font-medium ${course.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{course.name}</p>{course.description && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{course.description}</p>}</div></td>
                  <td className="px-4 sm:px-5 py-3.5"><span className="text-sm font-mono text-slate-400">{course.credits} CR</span></td>
                  <td className="px-4 sm:px-5 py-3.5"><div className="flex items-center justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => setEditCourse(course)} className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-950/60 border border-transparent hover:border-red-900/60"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteId(course.id)} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-950/60 border border-transparent hover:border-red-900/60"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal open={showAdd} onClose={() => setShowAdd(false)}><CourseForm title="Add New Course" initial={EMPTY_FORM} onSubmit={data => createMut.mutate(data)} onCancel={() => setShowAdd(false)} loading={createMut.isPending} /></Modal>
      <Modal open={!!editCourse} onClose={() => setEditCourse(null)}>{editCourse && <CourseForm title="Edit Course" initial={{ code: editCourse.code, name: editCourse.name, credits: editCourse.credits, description: editCourse.description }} onSubmit={data => updateMut.mutate({ id: editCourse.id, data })} onCancel={() => setEditCourse(null)} loading={updateMut.isPending} />}</Modal>
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4"><div className="w-10 h-10 bg-red-950 border border-red-800 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-red-500" /></div><div><h3 className="text-base font-bold text-white uppercase">Delete Course</h3><p className="text-sm text-slate-400">This removes all prerequisite links too.</p></div></div>
          <div className="flex gap-3">
            <button onClick={() => setDeleteId(null)} className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-400 border border-dark-600 uppercase hover:bg-dark-800">Cancel</button>
            <button onClick={() => deleteId !== null && deleteMut.mutate(deleteId)} disabled={deleteMut.isPending} className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-red-700 hover:bg-red-600 disabled:opacity-50 uppercase tracking-wider">{deleteMut.isPending ? 'Deleting...' : 'Confirm Delete'}</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
