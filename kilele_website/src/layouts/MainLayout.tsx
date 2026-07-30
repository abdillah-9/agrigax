import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { FaBars, FaXmark, FaWhatsapp, FaEnvelope, FaLocationDot, FaPhone } from 'react-icons/fa6';
import { COMPANY } from '../config';
import { useLanguage } from '../context/LanguageContext';
import type { Lang } from '../context/LanguageContext';
import logo from '../assets/logo.jpg';
import './styles/layout.css';

// "Our Team" points to the #team section of the About page.
const LINK_TARGETS = [
  { path: '/', hash: '' },
  { path: '/about', hash: '' },
  { path: '/services', hash: '' },
  { path: '/projects', hash: '' },
  { path: '/about', hash: '#team' },
  { path: '/contact', hash: '' },
] as const;

function useNavLinks() {
  const { t } = useLanguage();
  const labels = [t.nav.home, t.nav.about, t.nav.services, t.nav.projects, t.nav.team, t.nav.contact];
  return LINK_TARGETS.map((target, i) => ({ ...target, label: labels[i] }));
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const links = useNavLinks();
  const { pathname, hash } = useLocation();

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.path + link.hash}
          to={link.path + link.hash}
          className={pathname === link.path && hash === link.hash ? 'active' : ''}
          onClick={onNavigate}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

function LangToggle() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="langToggle">
      {(['en', 'sw'] as Lang[]).map((l) => (
        <button
          key={l}
          className={lang === l ? 'on' : ''}
          onClick={() => setLang(l)}
          aria-label={l === 'en' ? 'Switch to English' : 'Badili kwenda Kiswahili'}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

function Navbar() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="container navInner">
          <Link to="/" className="navBrand">
            <img src={logo} alt="Kilele Electricals logo" />
            <div>
              <div className="brandName">
                KILELE <span>ELECTRICALS</span>
              </div>
              <div className="brandTag">{COMPANY.slogan}</div>
            </div>
          </Link>

          <div className="navLinks">
            <NavItems />
          </div>

          <div className="navCta">
            <LangToggle />
            <Link to="/contact" className="btn btnGold">
              {t.nav.getQuote}
            </Link>
            <button className="navBurger" onClick={() => setOpen(true)} aria-label="Open menu">
              <FaBars />
            </button>
          </div>
        </div>
      </nav>

      {open && (
        <div className="mobileMenu">
          <button className="mobileClose" onClick={() => setOpen(false)} aria-label="Close menu">
            <FaXmark />
          </button>
          <NavItems onNavigate={() => setOpen(false)} />
          <div style={{ marginTop: '18px' }}>
            <LangToggle />
          </div>
        </div>
      )}
    </>
  );
}

function Footer() {
  const { t } = useLanguage();
  const links = useNavLinks();

  return (
    <footer className="footer">
      <div className="container footerGrid">
        <div>
          <div className="footerBrand">
            <img src={logo} alt="Kilele Electricals logo" />
            <div>
              <div className="brandName" style={{ fontFamily: 'Space Grotesk', fontWeight: 700 }}>
                KILELE <span style={{ color: 'var(--gold)' }}>ELECTRICALS</span>
              </div>
              <div className="brandTag" style={{ color: 'var(--muted)', fontSize: '12px' }}>
                {COMPANY.slogan}
              </div>
            </div>
          </div>
          <p>{t.footer.blurb}</p>
        </div>

        <div>
          <h4>{t.footer.quickLinks}</h4>
          <div className="footerLinks">
            {links.map((link) => (
              <Link key={link.path + link.hash} to={link.path + link.hash}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4>{t.footer.contactUs}</h4>
          <div className="footerContact">
            <a href={`mailto:${COMPANY.email}`}>
              <FaEnvelope /> {COMPANY.email}
            </a>
            <a href={`tel:${COMPANY.phone}`}>
              <FaPhone /> {COMPANY.phoneDisplay}
            </a>
            <a href={COMPANY.whatsapp()} target="_blank">
              <FaWhatsapp /> {t.footer.whatsappUs}
            </a>
            <div>
              <FaLocationDot /> {COMPANY.location}
            </div>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        © {new Date().getFullYear()} <span>{COMPANY.name}</span>. {t.footer.rights}
      </div>
    </footer>
  );
}

function MainLayout() {
  const { pathname, hash, key } = useLocation();
  const lastPath = useRef<string | null>(null);

  // Scroll to the anchored section (e.g. /about#team) or to the top.
  useEffect(() => {
    const changedPage = lastPath.current !== pathname;
    lastPath.current = pathname;

    if (hash) {
      const el = document.getElementById(hash.slice(1));
      if (el) {
        // Jump instantly when arriving from another page; scroll smoothly
        // when the user is already on this page. Note: 'auto' would defer to
        // the global `scroll-behavior: smooth`, so use 'instant' explicitly.
        const behavior: ScrollBehavior = changedPage ? 'instant' : 'smooth';
        const scroll = () => el.scrollIntoView({ behavior, block: 'start' });
        requestAnimationFrame(scroll);
        // Re-align once images have loaded, in case the layout shifted.
        window.addEventListener('load', scroll, { once: true });
        return () => window.removeEventListener('load', scroll);
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash, key]);

  return (
    <>
      <Navbar />
      <Outlet />
      <Footer />
      <a
        className="whatsFloat"
        href={COMPANY.whatsapp()}
        target="_blank"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp />
      </a>
    </>
  );
}

export default MainLayout;
