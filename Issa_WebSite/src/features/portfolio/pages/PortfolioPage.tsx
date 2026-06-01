import { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import {
  FiActivity,
  FiTrendingUp,
  FiDollarSign,
  FiBookOpen,
  FiGlobe,
  FiSmartphone,
} from 'react-icons/fi';
import '../styles/portfolio.css';

interface Project {
  id: number;
  title: string;
  description: string;
  category: string;
  year: number;
  tools: string[];
  icon: React.ReactNode;
  methodology: string[];
  outcome: string;
  client: string;
}

const projects: Project[] = [
  {
    id: 1,
    title: 'Maternal Health Outcomes Analysis',
    description:
      'Multi-level logistic regression analyzing factors associated with maternal mortality across 12 regions in Tanzania. Utilized DHS data spanning 2010-2022 with a sample of 15,000+ women.',
    category: 'Health',
    year: 2024,
    tools: ['R', 'Stan', 'GIS'],
    icon: <FiActivity size={52} />,
    methodology: [
      'Multi-level logistic regression',
      'Spatial autocorrelation analysis',
      'Propensity score matching',
      'Sensitivity analysis',
    ],
    outcome:
      'Findings informed the National Maternal Health Strategy 2025, leading to targeted interventions in 4 high-risk regions.',
    client: 'Ministry of Health, Tanzania',
  },
  {
    id: 2,
    title: 'Agricultural Yield Prediction',
    description:
      'Random forest and gradient boosting ensemble models predicting maize and rice yields using satellite imagery, weather data, and soil characteristics across 200 farms.',
    category: 'Agriculture',
    year: 2023,
    tools: ['Python', 'Scikit-learn', 'QGIS'],
    icon: <FiTrendingUp size={52} />,
    methodology: [
      'Random Forest & XGBoost',
      'Feature importance analysis',
      'Cross-validation (k=10)',
      'SHAP values interpretation',
    ],
    outcome:
      'Model achieved 89% prediction accuracy, enabling farmers to optimize planting schedules and input allocation.',
    client: 'SAGCOT Initiative',
  },
  {
    id: 3,
    title: 'Financial Inclusion Index',
    description:
      'PCA and structural equation modeling to develop a composite financial inclusion index for EAC member states, incorporating 25 indicators.',
    category: 'Economics',
    year: 2023,
    tools: ['Stata', 'AMOS', 'Excel'],
    icon: <FiDollarSign size={52} />,
    methodology: [
      'Principal Component Analysis',
      'Structural Equation Modeling',
      'Confirmatory Factor Analysis',
      'Panel data regression',
    ],
    outcome:
      'Index adopted by EAC Secretariat for annual financial inclusion reporting across all 7 member states.',
    client: 'East African Community',
  },
  {
    id: 4,
    title: 'Education Access Disparity Study',
    description:
      'Longitudinal analysis of secondary education completion rates examining gender and socioeconomic disparities across 500 schools in Tanzania.',
    category: 'Education',
    year: 2022,
    tools: ['Stata', 'R', 'Tableau'],
    icon: <FiBookOpen size={52} />,
    methodology: [
      'Fixed effects panel regression',
      'Difference-in-differences',
      'Blinder-Oaxaca decomposition',
      'Survival analysis',
    ],
    outcome:
      'Identified 23% gender gap in rural STEM completion, leading to scholarship programs reaching 5,000+ girls.',
    client: 'UNICEF Tanzania',
  },
  {
    id: 5,
    title: 'Climate Change & Food Security',
    description:
      'Integrated assessment combining climate projections (CMIP6) with household survey data to model food security outcomes in semi-arid Tanzania.',
    category: 'Agriculture',
    year: 2024,
    tools: ['R', 'Python', 'GIS'],
    icon: <FiGlobe size={52} />,
    methodology: [
      'Climate downscaling',
      'Crop simulation modeling',
      'Vulnerability index construction',
      'Scenario analysis',
    ],
    outcome:
      'Provided evidence base for $15M climate adaptation fund allocation targeting 200,000 smallholder farmers.',
    client: 'World Bank',
  },
  {
    id: 6,
    title: 'Digital Health Intervention RCT',
    description:
      'Cluster randomized controlled trial evaluating SMS-based health reminders on antenatal care attendance among 8,000 pregnant women.',
    category: 'Health',
    year: 2022,
    tools: ['R', 'REDCap', 'Power BI'],
    icon: <FiSmartphone size={52} />,
    methodology: [
      'Cluster RCT design',
      'Mixed-effects models',
      'Cost-effectiveness analysis',
      'Intention-to-treat analysis',
    ],
    outcome:
      'SMS reminders increased ANC4+ attendance by 18 percentage points, leading to national scale-up.',
    client: 'Gates Foundation',
  },
];

const categories = ['All', 'Health', 'Agriculture', 'Economics', 'Education'];

function PortfolioPage() {
  const [activeFilter, setActiveFilter] = useState('All');

  const filteredProjects =
    activeFilter === 'All'
      ? projects
      : projects.filter((p) => p.category === activeFilter);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -30px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [activeFilter]);

  return (
    <div className="portfolio-page">
      {/* Header */}
      <div className="portfolio-header">
        <h1 className="reveal">
          Project <span className="highlight">Portfolio</span>
        </h1>
        <p className="reveal">
          Statistical consulting and research projects spanning health,
          agriculture, economics, and education sectors
        </p>
      </div>

      <div className="container">
        {/* Impact Stats */}
        <div className="portfolio-stats reveal">
          <div className="portfolio-stat">
            <div className="portfolio-stat-number">150+</div>
            <div className="portfolio-stat-label">Projects</div>
          </div>
          <div className="portfolio-stat">
            <div className="portfolio-stat-number">45+</div>
            <div className="portfolio-stat-label">Publications</div>
          </div>
          <div className="portfolio-stat">
            <div className="portfolio-stat-number">30+</div>
            <div className="portfolio-stat-label">Organizations</div>
          </div>
          <div className="portfolio-stat">
            <div className="portfolio-stat-number">5M+</div>
            <div className="portfolio-stat-label">Data Points</div>
          </div>
        </div>

        {/* Filters */}
        <div className="portfolio-filters reveal">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn ${activeFilter === cat ? 'active' : ''}`}
              onClick={() => setActiveFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Project Grid */}
        <div className="portfolio-grid">
          {filteredProjects.map((project, index) => (
            <div
              key={project.id}
              className="project-card reveal"
              style={{ animationDelay: `${index * 0.08}s` }}
            >
              <div className="project-image">
                <div className="project-icon">{project.icon}</div>
                <MiniChartPreview projectId={project.id} />
              </div>
              <div className="project-body">
                <h3>{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  <span className="project-year">{project.year}</span>
                  <div className="project-tools">
                    {project.tools.slice(0, 3).map((tool, i) => (
                      <span key={i} className="project-tool">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="project-footer">
                  <p className="project-client">
                    <strong>Client:</strong> {project.client}
                  </p>
                  <p className="project-outcome">
                    <strong>Outcome:</strong> {project.outcome}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Mini D3 chart — enhanced with area fill + glow + scroll-triggered animation
function MiniChartPreview({ projectId }: { projectId: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const animated = useRef(false);

  useEffect(() => {
    if (!ref.current || animated.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          animated.current = true;
          drawChart();
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [projectId]);

  function drawChart() {
    if (!ref.current) return;
    const container = ref.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const secondaryColor = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';

    const svg = d3.select(container).append('svg').attr('width', w).attr('height', h);

    const seed = projectId * 42;
    const data = d3.range(24).map((i) => ({
      x: i,
      y: 18 + Math.sin(i * 0.45 + seed) * 14 + Math.random() * 8,
    }));

    const x = d3.scaleLinear().domain([0, 23]).range([16, w - 16]);
    const y = d3.scaleLinear().domain([0, 50]).range([h - 20, 20]);

    // Area fill
    const area = d3
      .area<{ x: number; y: number }>()
      .x((d) => x(d.x))
      .y0(h - 20)
      .y1((d) => y(d.y))
      .curve(d3.curveCatmullRom);

    svg
      .append('path')
      .datum(data)
      .attr('d', area)
      .attr('fill', primaryColor)
      .attr('opacity', 0)
      .transition()
      .duration(1200)
      .attr('opacity', 0.08);

    // Glow line
    const line = d3
      .line<{ x: number; y: number }>()
      .x((d) => x(d.x))
      .y((d) => y(d.y))
      .curve(d3.curveCatmullRom);

    svg
      .append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', secondaryColor)
      .attr('stroke-width', 2.5)
      .attr('stroke-opacity', 0.4)
      .attr('filter', 'url(#miniGlow)')
      .attr('stroke-dasharray', '300')
      .attr('stroke-dashoffset', '300')
      .transition()
      .duration(1800)
      .attr('stroke-dashoffset', '0');

    // Sharp line on top
    svg
      .append('path')
      .datum(data)
      .attr('d', line)
      .attr('fill', 'none')
      .attr('stroke', primaryColor)
      .attr('stroke-width', 1.8)
      .attr('stroke-dasharray', '300')
      .attr('stroke-dashoffset', '300')
      .transition()
      .delay(200)
      .duration(1600)
      .attr('stroke-dashoffset', '0');

    // Glow filter
    const defs = svg.append('defs');
    const filter = defs.append('filter').attr('id', 'miniGlow');
    filter.append('feGaussianBlur').attr('stdDeviation', '2.5').attr('result', 'blur');
    const merge = filter.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');
  }

  return <div ref={ref} className="chart-preview" />;
}

export default PortfolioPage;
