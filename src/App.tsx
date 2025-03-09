
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/ui/theme-provider';

import Index from './pages/Index';
import Visualize from './pages/Visualize';
import NotFound from './pages/NotFound';
import Auth from './pages/Auth';
import About from './pages/About';
import ProtectedRoute from './components/ProtectedRoute';
import YouTubeAnalysis from './pages/YouTubeAnalysis';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<About />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/visualize" element={<Visualize />} />
            <Route path="/youtube" element={<YouTubeAnalysis />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
        <Toaster />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
