import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, GitBranch, Network, CalendarDays, FlaskConical, GraduationCap, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/courses', icon: BookOpen, label: 'Courses' },
  { to: '/prerequisites', icon: GitBranch, label: 'Prerequisites' },
  { to: '/graph', icon: Network, label: 'Graph View' },
  { to: '/study-plan', icon: CalendarDays, label: 'Study Plan' },
  { to: '/algorithms', icon: FlaskConical, label: 'DM Concepts' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row h-screen bg-black overflow-hidden">
      {/* Mobile Header Bar */}
      <header className="md:hidden bg-dark-900 border-b border-red-900/40 p-4 flex items-center justify-between flex-shrink-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center border border-red-500/30">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white uppercase tracking-wide leading-tight">Course Planner</p>
            <p className="text-[10px] text-red-500 font-mono">Discrete Math</p>
          </div>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 text-slate-400 hover:text-white bg-dark-800 border border-red-900/40"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="w-5 h-5 text-red-500" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile Menu Backdrop */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/80 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-dark-900 border-r border-red-900/40 flex flex-col flex-shrink-0 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-red-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center shadow-lg shadow-red-900/30 border border-red-500/30">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-white tracking-wide uppercase leading-tight">Course Planner</p>
              <p className="text-xs text-red-500 font-mono">Discrete Math</p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1 text-slate-500 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 border ${
                  isActive
                    ? 'bg-red-950/60 text-red-400 border-red-600/60 shadow-inner'
                    : 'text-slate-400 hover:text-white hover:bg-dark-800 border-transparent'
                }`
              }
            >
              {({ isActive }: { isActive: boolean }) => (
                <>
                  <Icon className={`w-4 h-4 ${isActive ? 'text-red-500' : 'text-slate-500'}`} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-red-900/40 bg-dark-950">
          <div className="text-xs text-red-500/80 font-mono text-center">
            <p>Discrete Mathematics</p>
            <p className="text-slate-600">Poset & Graph Theory</p>
          </div>
        </div>
      </aside>

      {/* Main Page Body */}
      <main className="flex-1 overflow-auto bg-black w-full">{children}</main>
    </div>
  );
}
