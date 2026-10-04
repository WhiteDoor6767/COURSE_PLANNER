import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CourseManager from './pages/CourseManager';
import PrerequisiteManager from './pages/PrerequisiteManager';
import GraphView from './pages/GraphView';
import StudyPlan from './pages/StudyPlan';
import AlgorithmsConcepts from './pages/AlgorithmsConcepts';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 30000 } },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/courses" element={<CourseManager />} />
            <Route path="/prerequisites" element={<PrerequisiteManager />} />
            <Route path="/graph" element={<GraphView />} />
            <Route path="/study-plan" element={<StudyPlan />} />
            <Route path="/algorithms" element={<AlgorithmsConcepts />} />
          </Routes>
        </Layout>
      </Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: { background: '#111827', color: '#f1f5f9', border: '1px solid #1e293b', fontSize: '14px' },
          success: { iconTheme: { primary: '#10b981', secondary: '#111827' } },
          error: { iconTheme: { primary: '#ef4444', secondary: '#111827' } },
        }}
      />
    </QueryClientProvider>
  );
}
