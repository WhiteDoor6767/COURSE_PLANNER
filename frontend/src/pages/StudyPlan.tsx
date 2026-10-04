import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, BookOpen, CheckCircle2, Sliders } from 'lucide-react';
import { getStudyPlan } from '../api/client';

export default function StudyPlan() {
  const [maxCredits, setMaxCredits] = useState(18);
  const [input, setInput] = useState('18');
  const { data, isLoading } = useQuery({ queryKey: ['study-plan', maxCredits], queryFn: () => getStudyPlan(maxCredits) });

  return (
    <div className="p-4 sm:p-8 space-y-6 animate-fade-in max-w-7xl mx-auto">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
            <span className="w-2 h-6 bg-red-600 inline-block" />
            Semester Study Plan
          </h1>
          <p className="text-slate-400 text-xs sm:text-sm mt-1">Antichain partitioning respecting prerequisite partial order</p>
        </div>
        <div className="bg-dark-800 border border-red-900/40 p-3.5 sm:p-4 flex items-center gap-4 w-full sm:w-auto">
          <Sliders className="w-4 h-4 text-red-500 flex-shrink-0" />
          <div className="flex-1 sm:flex-initial"><p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Max Credits / Semester</p>
            <div className="flex items-center gap-2">
              <input type="number" min={3} max={30} value={input} onChange={e => setInput(e.target.value)} className="w-20 bg-black border border-red-900/50 px-2 py-1.5 text-sm text-white focus:outline-none focus:border-red-600 font-mono" />
              <button onClick={() => { const v=parseInt(input); if(v>=3&&v<=30) setMaxCredits(v); }} className="px-3.5 py-1.5 bg-red-700 hover:bg-red-600 text-white text-xs font-bold uppercase tracking-wider border border-red-500/40">Apply</button>
            </div>
          </div>
        </div>
      </div>

      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="bg-dark-800 border border-red-900/40 p-4 text-center"><p className="text-2xl font-bold text-white font-mono">{data.semesters.length}</p><p className="text-xs font-mono text-slate-400 uppercase mt-1">Semesters Required</p></div>
          <div className="bg-dark-800 border border-red-900/40 p-4 text-center"><p className="text-2xl font-bold text-red-400 font-mono">{data.total_courses}</p><p className="text-xs font-mono text-slate-400 uppercase mt-1">Total Courses</p></div>
          <div className="bg-dark-800 border border-red-900/40 p-4 text-center"><p className="text-2xl font-bold text-white font-mono">{data.total_credits}</p><p className="text-xs font-mono text-slate-400 uppercase mt-1">Total Credits</p></div>
        </div>
      )}

      {isLoading ? <div className="space-y-4">{[...Array(4)].map((_,i)=><div key={i} className="h-40 bg-dark-800 border border-dark-600 animate-pulse" />)}</div>
      : !data || data.semesters.length === 0 ? (
        <div className="text-center py-20 bg-dark-800 border border-red-900/40"><CalendarDays className="w-12 h-12 text-red-900 mx-auto mb-4" /><p className="text-slate-500 font-mono uppercase">No study plan generated</p></div>
      ) : (
        <div className="space-y-4">
          {data.semesters.map((semester, i) => (
            <div key={semester.semester} className="bg-dark-800 border border-red-900/40 overflow-hidden animate-slide-up" style={{ animationDelay: `${i*80}ms` }}>
              <div className="p-4 bg-gradient-to-r from-red-950 via-dark-900 to-black border-b border-red-900/50 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <span className="w-2 h-2 bg-red-600" />
                  Semester {semester.semester}
                </h3>
                <span className="bg-red-950 text-red-400 border border-red-700/60 px-3 py-1 font-mono text-xs font-bold uppercase">{semester.total_credits} Credits</span>
              </div>
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {semester.courses.map(course => (
                  <div key={course.id} className="bg-dark-900 border border-red-900/30 p-4 relative overflow-hidden group hover:border-red-600/60 transition-colors">
                    {course.completed && <div className="absolute top-0 right-0 p-2"><CheckCircle2 className="w-4 h-4 text-red-500" /></div>}
                    <div className="flex items-center gap-2 mb-1">
                      <BookOpen className={`w-4 h-4 ${course.completed ? 'text-red-500' : 'text-red-400'}`} />
                      <span className="font-mono text-sm font-bold text-red-400">{course.code}</span>
                    </div>
                    <p className={`text-sm font-medium mb-2 ${course.completed ? 'text-slate-500 line-through' : 'text-slate-300'}`}>{course.name}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-xs font-mono text-slate-500">{course.credits} Credits</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
