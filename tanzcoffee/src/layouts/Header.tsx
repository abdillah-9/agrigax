import { useEffect, useState } from 'react';
import { FaBars } from 'react-icons/fa6';
import { PiInstagramLogo, PiWhatsappLogoFill } from 'react-icons/pi';
import { TbBrandLinkedinFilled } from 'react-icons/tb';
import { PAGES, useNav } from '../context/NavContext';
import logoWhite from '../assets/logoWHITE.webp';

function Brand() {
  const [loaded, setLoaded] = useState(false);
  const [logoSrc, setLogoSrc] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src = logoWhite;
    img.onload = () => {
      setLogoSrc(img.src);
      setLoaded(true);
    };
  }, []);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
      <div
        style={{
          width: '65px',
          height: '65px',
          borderRadius: '50%',
          overflow: 'hidden',
          backgroundColor: '#ffffff20',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {loaded && logoSrc ? (
          <img
            src={logoSrc}
            alt="logo"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center',
              display: 'block',
              scale: 1.32,
            }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(255,255,255,0.2)',
              animation: 'pulse 1.5s infinite',
            }}
          />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '17px', color: 'white', fontWeight: 700, whiteSpace: 'nowrap' }}>
          TanzCoffee Trading Company Ltd
        </span>
        <span
          style={{
            fontSize: '13px',
            color: 'white',
            opacity: 0.85,
            fontStyle: 'italic',
            marginTop: '-3px',
          }}
        >
          We are proud to serve you
        </span>
      </div>
    </div>
  );
}

function NavLinks() {
  const { activeLink, setActiveLink } = useNav();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div>
      <div className="navIcon">
        <FaBars
          style={{ fontSize: '20px', color: 'white', cursor: 'pointer' }}
          onClick={() => setMenuOpen(!menuOpen)}
        />
      </div>

      <div
        style={{
          gap: '6px',
          flexWrap: 'wrap',
          height: '100%',
          color: 'white',
          fontWeight: 500,
          alignItems: 'center',
        }}
        className="navLinks"
      >
        {PAGES.map((page) => (
          <div
            key={page}
            onClick={() => setActiveLink(page)}
            className={activeLink === page ? 'navLink navLinkActive' : 'navLink'}
          >
            {page}
          </div>
        ))}
      </div>

      {menuOpen && (
        <div
          className="mobileMenu"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            backgroundColor: '#2b6603ff',
            padding: '0px',
            marginTop: '10px',
            borderRadius: '12px',
            color: 'white',
          }}
        >
          {PAGES.map((page) => (
            <div
              key={page}
              onClick={() => {
                setActiveLink(page);
                setMenuOpen(false);
              }}
              style={
                activeLink === page
                  ? {
                      background: 'linear-gradient(135deg, #dd9d6dff, #c9834f)',
                      padding: '12px',
                      width: '100vw',
                    }
                  : { backgroundColor: 'rgba(0,0,0,0)', padding: '12px' }
              }
            >
              {page}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Header() {
  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        width: '100vw',
        minHeight: '100px',
        padding: '10px 15px',
        background: 'linear-gradient(135deg, #1d4a02 0%, #2b6603 55%, #3d8207 100%)',
        boxShadow: '0 6px 24px rgba(0, 0, 0, 0.28)',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <Brand />
      <NavLinks />
      <div style={{ display: 'flex', gap: '15px', color: 'white' }}>
        <a href="https://wa.me/255788491086" target="_blank" className="socialIcon">
          <PiWhatsappLogoFill style={{ fontSize: '27px', color: 'white' }} />
        </a>
        <a href="https://www.instagram.com/tanzcoffee_" target="_blank" className="socialIcon">
          <PiInstagramLogo style={{ fontSize: '27px', color: 'white' }} />
        </a>
        <a
          href="https://www.linkedin.com/company/tanzcoffee-trading-company-limited/"
          target="_blank"
          className="socialIcon"
        >
          <TbBrandLinkedinFilled style={{ fontSize: '27px', color: 'white' }} />
        </a>
      </div>
    </div>
  );
}

export default Header;
