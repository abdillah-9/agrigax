import { Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './features/home/pages/HomePage';
import AboutPage from './features/about/pages/AboutPage';
import ServicesPage from './features/services/pages/ServicesPage';
import ProjectsPage from './features/projects/pages/ProjectsPage';
import ContactPage from './features/contact/pages/ContactPage';

function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>
    </Routes>
  );
}

export default App;
