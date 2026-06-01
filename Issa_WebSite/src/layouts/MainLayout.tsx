import { useState, useEffect, useRef } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { FiSun, FiMoon, FiMenu, FiX } from 'react-icons/fi';
import { useDarkMode } from '../hooks/useDarkMode';
import './styles/layout.css';

function MainLayout() {
  const [isDark, toggleDark] = useDarkMode();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/portfolio', label: 'Portfolio' },
    { to: '/dashboard', label: 'Dashboard' },
    { to: '/blog', label: 'Blog' },
    { to: '/contact', label: 'Contact' },
  ];

  return (
    <div className="page-wrapper">
      <nav ref={navRef} className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="navbar-inner">
          <Link to="/" className="nav-logo">
            IR<span className="logo-dot"></span>M
          </Link>

          <div className={`nav-links ${menuOpen ? 'open' : ''}`}>
            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `nav-link ${isActive ? 'active' : ''}`
                }
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          <div className="nav-actions">
            <button
              className="theme-toggle"
              onClick={toggleDark}
              aria-label="Toggle theme"
            >
              {isDark ? <FiSun /> : <FiMoon />}
            </button>
            <button
              className="mobile-menu-btn"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>
      </nav>

      <main className="page-content">
        <Outlet />
      </main>

      <footer className="footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <h3>Issa Rajabu Mbombwe</h3>
            <p>
              Professional statistician and data scientist specializing in statistical modeling,
              predictive analytics, and data-driven decision making for research and industry.
            </p>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <Link to="/">Home</Link>
            <Link to="/portfolio">Portfolio</Link>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/blog">Blog</Link>
          </div>
          <div className="footer-col">
            <h4>Services</h4>
            <a href="#">Statistical Consulting</a>
            <a href="#">Data Analysis</a>
            <a href="#">Research Design</a>
            <a href="#">Training</a>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:issa.mbombwe@email.com">issa.mbombwe@email.com</a>
            <a href="tel:+255123456789">+255 123 456 789</a>
            <a href="#">Dar es Salaam, Tanzania</a>
          </div>
        </div>
        <div className="footer-bottom">
          <span>&copy; {new Date().getFullYear()} Issa Rajabu Mbombwe. All rights reserved.</span>
          <div className="footer-social">
            <a href="#" aria-label="LinkedIn">in</a>
            <a href="#" aria-label="Twitter">𝕏</a>
            <a href="#" aria-label="GitHub">GH</a>
            <a href="#" aria-label="ResearchGate">RG</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default MainLayout;
