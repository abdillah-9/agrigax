import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './features/home/pages/HomePage';
import PortfolioPage from './features/portfolio/pages/PortfolioPage';
import Dashboard from './features/dashboard/pages/Dashboard';
import BlogPage from './features/blog/pages/BlogPage';
import ContactPage from './features/contact/pages/ContactPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default App;
