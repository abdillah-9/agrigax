import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaXmark } from 'react-icons/fa6';
import { useLanguage } from '../../../context/LanguageContext';
import '../styles/projects.css';

import heroImg from '../../../assets/rebar_walk_2.jpeg';
import slab1 from '../../../assets/slab_piping.jpeg';
import slab2 from '../../../assets/slab_piping_2.jpeg';
import slab3 from '../../../assets/slab_conduits.jpeg';
import slab4 from '../../../assets/slab_conduits_2.jpeg';
import slab5 from '../../../assets/conduit_cutting.jpeg';
import site1 from '../../../assets/rooftop_crew.jpeg';
import site2 from '../../../assets/rebar_team_2.jpeg';
import site3 from '../../../assets/rebar_team_3.jpeg';
import site4 from '../../../assets/rebar_team_4.jpeg';
import site5 from '../../../assets/rebar_team_5.jpeg';
import inst1 from '../../../assets/panel_install.jpeg';
import inst2 from '../../../assets/fuse_links.jpeg';
import inst3 from '../../../assets/switchgear.jpeg';
import inst4 from '../../../assets/indoor_wiring.jpeg';
import inst5 from '../../../assets/exterior_wiring.jpeg';
import team1 from '../../../assets/team_selfie.jpeg';
import team2 from '../../../assets/crew_container_2.jpeg';
import team3 from '../../../assets/crew_container_3.jpeg';
import team4 from '../../../assets/portrait_seated.jpeg';
import team5 from '../../../assets/ferry_deck_2.jpeg';

type CategoryId = 'conduit' | 'site' | 'install' | 'team';
type FilterId = 'all' | CategoryId;

const FILTER_IDS: FilterId[] = ['all', 'conduit', 'site', 'install', 'team'];

// Captions live in translations (t.projects.captions), matched by index.
const GALLERY: Array<{ img: string; cat: CategoryId; tall?: boolean }> = [
  { img: slab1, cat: 'conduit', tall: true },
  { img: inst1, cat: 'install' },
  { img: site1, cat: 'site' },
  { img: slab5, cat: 'conduit' },
  { img: team1, cat: 'team', tall: true },
  { img: inst4, cat: 'install' },
  { img: site2, cat: 'site' },
  { img: slab2, cat: 'conduit', tall: true },
  { img: inst2, cat: 'install' },
  { img: team2, cat: 'team' },
  { img: site3, cat: 'site' },
  { img: inst3, cat: 'install' },
  { img: slab3, cat: 'conduit', tall: true },
  { img: team4, cat: 'team' },
  { img: site4, cat: 'site' },
  { img: inst5, cat: 'install' },
  { img: slab4, cat: 'conduit' },
  { img: team3, cat: 'team' },
  { img: site5, cat: 'site' },
  { img: team5, cat: 'team' },
];

function ProjectsPage() {
  const { t } = useLanguage();
  const [filter, setFilter] = useState<FilterId>('all');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const items = GALLERY.map((g, i) => ({ ...g, cap: t.projects.captions[i] }));
  const visible = filter === 'all' ? items : items.filter((g) => g.cat === filter);

  return (
    <main>
      <header className="pageHero" style={{ backgroundImage: `url(${heroImg})` }}>
        <div className="container fadeUp">
          <span className="kicker">{t.projects.heroKicker}</span>
          <h1>
            {t.projects.heroTitle.pre}
            <span style={{ color: 'var(--gold)' }}>{t.projects.heroTitle.accent}</span>
          </h1>
          <p>{t.projects.heroLead}</p>
        </div>
      </header>

      <section className="section" style={{ paddingTop: '40px' }}>
        <div className="container">
          <div className="filterBar">
            {FILTER_IDS.map((id) => (
              <button
                key={id}
                className={`filterBtn ${filter === id ? 'on' : ''}`}
                onClick={() => setFilter(id)}
              >
                {t.projects.filters[id]}
              </button>
            ))}
          </div>

          <div className="projGrid" key={filter}>
            {visible.map((g) => (
              <div
                key={g.img}
                className={`projTile ${g.tall ? 'tall' : ''}`}
                onClick={() => setLightbox(g.img)}
              >
                <img src={g.img} alt={g.cap} loading="lazy" />
                <div className="cap">
                  <span>{t.projects.filters[g.cat]}</span>
                  {g.cap}
                </div>
              </div>
            ))}
          </div>

          <div className="center" style={{ marginTop: '54px' }}>
            <p className="sectionLead" style={{ margin: '0 auto 26px auto' }}>
              {t.projects.ctaLead}
            </p>
            <Link to="/contact" className="btn btnGold">
              {t.projects.ctaBtn} <FaArrowRight />
            </Link>
          </div>
        </div>
      </section>

      {lightbox && (
        <div className="lightbox" onClick={() => setLightbox(null)}>
          <button className="lightboxClose" aria-label="Close image">
            <FaXmark />
          </button>
          <img src={lightbox} alt="Project photo enlarged" />
        </div>
      )}
    </main>
  );
}

export default ProjectsPage;
