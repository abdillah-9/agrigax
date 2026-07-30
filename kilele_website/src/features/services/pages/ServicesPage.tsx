import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheck } from 'react-icons/fa6';
import { useLanguage } from '../../../context/LanguageContext';
import '../styles/services.css';

import heroImg from '../../../assets/slab_piping_3.jpeg';
import imgWiring from '../../../assets/indoor_wiring.jpeg';
import imgConduit from '../../../assets/slab_piping_4.jpeg';
import imgBoards from '../../../assets/panel_install.jpeg';
import imgPower from '../../../assets/switchgear.jpeg';
import imgMaintenance from '../../../assets/exterior_wiring.jpeg';

const SERVICE_IMAGES = [imgWiring, imgConduit, imgBoards, imgPower, imgMaintenance];

function ServicesPage() {
  const { t } = useLanguage();

  return (
    <main>
      <header className="pageHero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="container fadeUp">
          <span className="kicker">{t.services.heroKicker}</span>
          <h1>
            {t.services.heroTitle.pre}
            <span style={{ color: 'var(--gold)' }}>{t.services.heroTitle.accent}</span>
          </h1>
          <p>{t.services.heroLead}</p>
        </div>
      </header>

      {/* Service rows */}
      <section className="section" style={{ paddingTop: '30px' }}>
        <div className="container">
          {t.services.items.map((s, i) => {
            const details = (
              <div>
                <span className="kicker">
                  {t.services.serviceLabel} 0{i + 1}
                </span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
                <ul className="svcPoints">
                  {s.points.map((p) => (
                    <li key={p}>
                      <FaCheck /> {p}
                    </li>
                  ))}
                </ul>
              </div>
            );
            const photo = (
              <div className="photo">
                <img src={SERVICE_IMAGES[i]} alt={s.title} loading="lazy" />
              </div>
            );

            return (
              <div key={s.title} className="svcRow">
                {i % 2 === 0 ? (
                  <>
                    {details}
                    {photo}
                  </>
                ) : (
                  <>
                    {photo}
                    {details}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container center">
          <span className="kicker">{t.services.stepsKicker}</span>
          <h2 className="sectionTitle">
            {t.services.stepsTitle.pre}
            <span className="accent">{t.services.stepsTitle.accent}</span>
          </h2>
          <p className="sectionLead">{t.services.stepsLead}</p>

          <div className="stepsGrid">
            {t.services.steps.map((s, i) => (
              <div key={s.title} className="card stepCard">
                <div className="stepNum">0{i + 1}</div>
                <h4>{s.title}</h4>
                <p>{s.text}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '48px' }}>
            <Link to="/contact" className="btn btnGold">
              {t.services.requestQuote} <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ServicesPage;
