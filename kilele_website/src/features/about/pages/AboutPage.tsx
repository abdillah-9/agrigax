import { Link } from 'react-router-dom';
import { FaArrowRight, FaHelmetSafety, FaShieldHalved, FaLightbulb } from 'react-icons/fa6';
import { COMPANY } from '../../../config';
import { useLanguage } from '../../../context/LanguageContext';
import '../styles/about.css';

import heroImg from '../../../assets/rebar_team.jpeg';
import storyImg from '../../../assets/portrait_yellow.jpeg';
import cultureFerry from '../../../assets/ferry_deck.jpeg';
import cultureSelfie from '../../../assets/team_selfie.jpeg';
import cultureCrew from '../../../assets/crew_container.jpeg';
import cultureSite from '../../../assets/portrait_orange.jpeg';
import cultureHelmets from '../../../assets/helmets_selfie.jpeg';
import cultureFerry2 from '../../../assets/ferry_team.jpeg';

// Member photos: team_1.jpeg .. team_6.jpeg map to members 1..6 in order.
// To update a photo, replace the matching file in src/assets/.
import team1 from '../../../assets/team_1.jpeg';
import team2 from '../../../assets/team_2.jpeg';
import team3 from '../../../assets/team_3.jpeg';
import team4 from '../../../assets/team_4.jpeg';
import team5 from '../../../assets/team_5.jpeg';
import team6 from '../../../assets/team_6.jpeg';

const VALUE_ICONS = [
  <FaHelmetSafety key="v1" />,
  <FaShieldHalved key="v2" />,
  <FaLightbulb key="v3" />,
];

// Team members — names are fixed; roles come from translations (same order).
const TEAM = [
  { name: 'Suleiman R Suleiman', img: team1 },
  { name: 'Ishaka Mpogo', img: team2 },
  { name: 'Master', img: team3 },
  { name: 'Juma Mpogo', img: team4 },
  { name: 'Rashid Adam', img: team5 },
  { name: 'Yahaya Hussein', img: team6 },
];

const CULTURE = [cultureFerry, cultureSelfie, cultureCrew, cultureSite, cultureHelmets, cultureFerry2];

function AboutPage() {
  const { t } = useLanguage();

  return (
    <main>
      <header className="pageHero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="container fadeUp">
          <span className="kicker">{t.about.heroKicker}</span>
          <h1>
            {t.about.heroTitle.pre}
            <span style={{ color: 'var(--gold)' }}>{t.about.heroTitle.accent}</span>
          </h1>
          <p>{t.about.heroLead}</p>
        </div>
      </header>

      {/* Story */}
      <section className="section">
        <div className="container storySplit">
          <div className="storyText">
            <span className="kicker">{t.about.storyKicker}</span>
            <h2 className="sectionTitle">
              {t.about.storyTitle.pre}
              <span className="accent">{t.about.storyTitle.accent}</span>
            </h2>
            {t.about.storyParas.map((para) => (
              <p key={para.slice(0, 24)}>{para}</p>
            ))}

            <div className="sloganCard">
              <div className="sw">“{COMPANY.slogan}”</div>
              <div className="en">{t.about.sloganExplain}</div>
            </div>
          </div>

          <div className="photo">
            <img src={storyImg} alt="Kilele Electricals technician on site" />
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container center">
          <span className="kicker">{t.about.valuesKicker}</span>
          <h2 className="sectionTitle">
            {t.about.valuesTitle.pre}
            <span className="accent">{t.about.valuesTitle.accent}</span>
          </h2>
          <p className="sectionLead">{t.about.valuesLead}</p>

          <div className="valGrid">
            {t.about.values.map((v, i) => (
              <div key={v.title} className="card valCard">
                <div className="iconBadge">{VALUE_ICONS[i]}</div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section id="team" className="section">
        <div className="container center">
          <span className="kicker">{t.about.teamKicker}</span>
          <h2 className="sectionTitle">
            {t.about.teamTitle.pre}
            <span className="accent">{t.about.teamTitle.accent}</span>
          </h2>
          <p className="sectionLead">{t.about.teamLead}</p>

          <div className="teamGrid">
            {TEAM.map((member, i) => (
              <div key={member.name} className="card teamCard">
                <div className="teamPhoto">
                  <img src={member.img} alt={member.name} loading="lazy" />
                </div>
                <div className="teamInfo">
                  <h3>{member.name}</h3>
                  <span>{t.about.teamRoles[i]}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Culture */}
      <section className="section" style={{ background: 'var(--surface)' }}>
        <div className="container center">
          <span className="kicker">{t.about.cultureKicker}</span>
          <h2 className="sectionTitle">
            {t.about.cultureTitle.pre}
            <span className="accent">{t.about.cultureTitle.accent}</span>
          </h2>
          <p className="sectionLead">{t.about.cultureLead}</p>

          <div className="cultureGrid">
            {CULTURE.map((img, i) => (
              <div key={i} className="photo">
                <img src={img} alt="Kilele Electricals team" loading="lazy" />
              </div>
            ))}
          </div>

          <div style={{ marginTop: '48px' }}>
            <Link to="/contact" className="btn btnGold">
              {t.about.workWithUs} <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutPage;
