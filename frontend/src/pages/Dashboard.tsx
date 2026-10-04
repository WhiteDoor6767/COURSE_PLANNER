import { useQuery } from '@tanstack/react-query';
import { BookOpen, CheckCircle2, Clock, Zap, GitBranch, TrendingUp, AlertCircle, ShieldCheck } from 'lucide-react';
import { getStats, getAvailableCourses, validateGraph } from '../api/client';

function StatCard({ title, value, icon: Icon, gradient, subtitle }: { title: string; value: number | string; icon: React.ComponentType<{ className?: string }>; gradient: string; subtitle?: string }) {
  return (
    <div className="bg-dark-800 border border-red-900/40 p-6 hover:border-red-600/60 transition-all duration-300 group animate-slide-up">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">{title}</p>
          <p className="text-3xl font-bold text-white tabular-nums font-mono">{value}</p>
          {subtitle && <p className="text-xs text-red-400/80 mt-1.5">{subtitle}</p>}
        </div>
        <div className={`w-11 h-11 ${gradient} flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300 border border-red-500/30`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({ queryKey: ['stats'], queryFn: getStats, refetchInterval: 5000 });
  const { data: available } = useQuery({ queryKey: ['available-courses'], queryFn: getAvailableCourses });
  const { data: validation } = useQuery({ queryKey: ['validate-graph'], queryFn: validateGraph });

  return (
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-fade-in max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white uppercase tracking-wider flex items-center gap-3">
          <span className="w-2 h-6 bg-red-600 inline-block" />
          Dashboard Overview
        </h1>
        <p className="text-slate-400 mt-1 text-xs sm:text-sm">Course prerequisite system status and metrics</p>
      </div>

      {validation && (
        <div className={`flex items-center gap-3 p-3.5 sm:p-4 border text-xs sm:text-sm font-medium ${validation.valid ? 'bg-red-950/40 border-red-600/50 text-red-300' : 'bg-red-900/60 border-red-500 text-red-200'}`}>
          {validation.valid ? (
            <><ShieldCheck className="w-5 h-5 text-red-500 flex-shrink-0" /><span className="font-mono">GRAPH VALIDITY: Valid DAG (No circular dependencies)</span></>
          ) : (
            <><AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" /><span className="font-mono">CIRCULAR DEPENDENCY: {validation.cycle_courses.map(c => c.code).join(' -> ')}</span></>
          )}
        </div>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[...Array(6)].map((_,i)=><div key={i} className="h-28 bg-dark-800 animate-pulse border border-dark-600" />)}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard title="Total Courses" value={stats?.total_courses ?? 0} icon={BookOpen} gradient="bg-gradient-to-br from-red-700 to-red-900" />
          <StatCard title="Completed" value={stats?.completed_courses ?? 0} icon={CheckCircle2} gradient="bg-gradient-to-br from-red-600 to-red-800" />
          <StatCard title="Available Now" value={stats?.available_courses ?? 0} icon={Zap} gradient="bg-gradient-to-br from-red-800 to-black" />
          <StatCard title="Remaining" value={stats?.remaining_courses ?? 0} icon={Clock} gradient="bg-gradient-to-br from-dark-700 to-red-950" />
          <StatCard title="Prerequisites" value={stats?.total_prerequisites ?? 0} icon={GitBranch} gradient="bg-gradient-to-br from-red-600 to-dark-900" />
          <StatCard title="Completion Rate" value={`${stats?.completion_percentage ?? 0}%`} icon={TrendingUp} gradient="bg-gradient-to-br from-red-900 to-red-600" subtitle="degree completion progress" />
        </div>
      )}

      {stats && (
        <div className="bg-dark-800 border border-red-900/40 p-6">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-white uppercase tracking-wider">Overall Degree Progress</span>
            <span className="text-sm font-mono text-red-400">{stats.completed_courses} / {stats.total_courses} courses completed</span>
          </div>
          <div className="w-full bg-dark-900 border border-red-950 h-3 overflow-hidden">
            <div className="bg-gradient-to-r from-red-800 via-red-600 to-red-500 h-full transition-all duration-700 ease-out" style={{ width: `${stats.completion_percentage}%` }} />
          </div>
          <div className="flex justify-between mt-3 text-xs font-mono text-slate-500">
            <span>0%</span>
            <span className="text-red-400 font-bold">{stats.completion_percentage}%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {available && available.available.length > 0 && (
        <div className="bg-dark-800 border border-red-900/40 p-6">
          <div className="flex items-center gap-2 mb-5 border-b border-dark-600 pb-3">
            <Zap className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Available for Immediate Enrollment</h2>
            <span className="ml-auto text-xs font-mono bg-red-950 text-red-400 px-3 py-1 border border-red-800/60">{available.available.length} COURSES</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {available.available.map(course => (
              <div key={course.id} className="flex items-center gap-3 p-3.5 bg-dark-900 border border-red-900/30 hover:border-red-600/50 transition-colors">
                <div className="w-2 h-2 bg-red-600 flex-shrink-0" />
                <div className="min-w-0">
                  <span className="text-sm font-mono font-bold text-red-400">{course.code}</span>
                  <span className="text-sm text-slate-300 ml-2">{course.name}</span>
                </div>
                <span className="ml-auto text-xs font-mono text-slate-400 flex-shrink-0">{course.credits} CR</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {validation && validation.valid && validation.topological_order.length > 0 && (
        <div className="bg-dark-800 border border-red-900/40 p-6">
          <div className="flex items-center gap-2 mb-4 border-b border-dark-600 pb-3">
            <TrendingUp className="w-4 h-4 text-red-500" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider">Topological Sort Order Sequence</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {validation.topological_order.map((course, i) => (
              <div key={course.id} className="flex items-center gap-1.5">
                <span className={`px-3 py-1.5 text-xs font-mono font-bold border ${course.completed ? 'bg-red-950/80 text-red-400 border-red-600' : 'bg-dark-900 text-slate-300 border-dark-600'}`}>{course.code}</span>
                {i < validation.topological_order.length - 1 && <span className="text-red-600 text-xs font-bold font-mono">→</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
