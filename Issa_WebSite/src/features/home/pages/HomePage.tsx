import { useEffect } from 'react';
import HeroSection from '../components/HeroSection';
import ServicesSection from '../components/ServicesSection';
import WorkShowcase from '../components/WorkShowcase';
import VizPreview from '../components/VizPreview';
import CTASection from '../components/CTASection';
import '../styles/home.css';

function HomePage() {
  useEffect(() => {
    // Scroll reveal animation
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <HeroSection />
      <ServicesSection />
      <WorkShowcase />
      <VizPreview />
      <CTASection />
    </>
  );
}

export default HomePage;
