import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaBolt, FaHelmetSafety, FaCheck } from 'react-icons/fa6';
import {
  MdElectricalServices,
  MdOutlineCable,
  MdOutlineElectricBolt,
  MdEngineering,
} from 'react-icons/md';
import { TbCertificate, TbClockCheck } from 'react-icons/tb';
import { COMPANY } from '../../../config';
import { useLanguage } from '../../../context/LanguageContext';
import '../styles/home.css';

import heroRooftop from '../../../assets/rooftop_crew.jpeg';
import heroSlab from '../../../assets/slab_piping.jpeg';
import heroRebar from '../../../assets/rebar_walk.jpeg';
import whyPanel from '../../../assets/panel_install.jpeg';
import whyConduit from '../../../assets/conduit_cutting.jpeg';
import whySelfie from '../../../assets/helmets_selfie.jpeg';
import workSlab2 from '../../../assets/slab_piping_2.jpeg';
import workTeam from '../../../assets/rebar_team.jpeg';
import workWiring from '../../../assets/indoor_wiring.jpeg';
import workExterior from '../../../assets/exterior_wiring.jpeg';
import workConduits from '../../../assets/slab_conduits.jpeg';
import workSwitchgear from '../../../assets/switchgear.jpeg';

const HERO_SLIDES = [heroRooftop, heroSlab, heroRebar];
const STAT_NUMS = ['50+', '20+', '100%', '24/7'];
const SERVICE_ICONS = [
  <MdElectricalServices key="i1" />,
  <MdOutlineCable key="i2" />,
  <MdOutlineElectricBolt key="i3" />,
  <FaBolt key="i4" />,
  <MdEngineering key="i5" />,
  <FaHelmetSafety key="i6" />,
];
const BADGE_ICONS = [
  <TbCertificate key="b1" size={20} />,
  <FaHelmetSafety key="b2" size={18} />,
  <TbClockCheck key="b3" size={20} />,
];
const WORK_STRIP = [workSlab2, workTeam, workWiring, workExterior, workConduits, workSwitchgear];

function HomePage() {
  const { t } = useLanguage();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main>
      {/* Hero */}
      <section className="hero">
        {HERO_SLIDES.map((img, i) => (
          <div
            key={img}
            className={`heroSlide ${i === slide ? 'on' : ''}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        <div className="heroShade" />

        <div className="container heroContent fadeUp">
          <div className="heroBadge">
            <FaBolt /> {t.home.heroBadge}
          </div>
          <h1>
            {t.home.heroTitle.pre}
            <span className="accent">{t.home.heroTitle.accent}</span>
          </h1>
          <p className="heroLead">{t.home.heroLead}</p>
          <div className="heroBtns">
            <Link to="/contact" className="btn btnGold">
              {t.home.heroBtnQuote} <FaArrowRight />
            </Link>
            <Link to="/projects" className="btn btnGhost">
              {t.home.heroBtnWork}
            </Link>
          </div>
          <div className="heroSlogan">
            <span className="line" />
            {COMPANY.slogan}
            <span className="line" />
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="statsGrid">
            {t.home.stats.map((lbl, i) => (
              <div key={lbl} className="statCell">
                <div className="num">{STAT_NUMS[i]}</div>
                <div className="lbl">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="section">
        <div className="container center">
          <span className="kicker">{t.home.svcKicker}</span>
          <h2 className="sectionTitle">
            {t.home.svcTitle.pre}
            <span className="accent">{t.home.svcTitle.accent}</span>
          </h2>
          <p className="sectionLead">{t.home.svcLead}</p>

          <div className="svcGrid" style={{ textAlign: 'left' }}>
            {t.home.services.map((s, i) => (
              <div key={s.title} className="card svcCard">
                <div className="iconBadge">{SERVICE_ICONS[i]}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '44px' }}>
            <Link to="/services" className="btn btnGhost">
              {t.home.exploreServices} <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container whySplit">
          <div className="whyPhotos">
            <div className="photo">
              <img src={whyPanel} alt="Technician installing a distribution board" />
            </div>
            <div className="photo">
              <img src={whyConduit} alt="Conduit preparation on site" />
            </div>
            <div className="photo">
              <img src={whySelfie} alt="Kilele Electricals technicians on site" />
            </div>
          </div>

          <div>
            <span className="kicker">{t.home.whyKicker}</span>
            <h2 className="sectionTitle">
              {t.home.whyTitle.pre}
              <span className="accent">{t.home.whyTitle.accent}</span>
            </h2>
            <p className="sectionLead">{t.home.whyLead}</p>

            <div className="whyList">
              {t.home.why.map((w) => (
                <div key={w.title} className="whyItem">
                  <div className="tick">
                    <FaCheck />
                  </div>
                  <div>
                    <strong>{w.title}</strong>
                    <span>{w.text}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Work strip */}
      <section className="section">
        <div className="container center">
          <span className="kicker">{t.home.workKicker}</span>
          <h2 className="sectionTitle">
            {t.home.workTitle.pre}
            <span className="accent">{t.home.workTitle.accent}</span>
          </h2>
          <p className="sectionLead">{t.home.workLead}</p>
        </div>

        <div className="marqueeWrap">
          <div className="marquee">
            {[...WORK_STRIP, ...WORK_STRIP].map((img, i) => (
              <div key={i} className="photo">
                <img src={img} alt="Kilele Electricals project photo" loading="lazy" />
              </div>
            ))}
          </div>
        </div>

        <div className="container center" style={{ marginTop: '44px' }}>
          <Link to="/projects" className="btn btnGold">
            {t.home.viewGallery} <FaArrowRight />
          </Link>
        </div>
      </section>

      {/* Credibility + CTA */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="ctaBanner">
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '34px',
                flexWrap: 'wrap',
                marginBottom: '26px',
                color: 'var(--gold)',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              {t.home.ctaBadges.map((badge, i) => (
                <span key={badge} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {BADGE_ICONS[i]} {badge}
                </span>
              ))}
            </div>
            <h2>{t.home.ctaTitle}</h2>
            <p>{t.home.ctaLead}</p>
            <Link to="/contact" className="btn btnGold">
              {t.home.ctaBtn} <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default HomePage;
