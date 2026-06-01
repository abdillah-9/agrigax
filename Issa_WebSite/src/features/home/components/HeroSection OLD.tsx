import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FiArrowRight, FiBarChart2 } from 'react-icons/fi';

interface ParticleNode extends d3.SimulationNodeDatum {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

function HeroSection() {
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const svg = d3
      .select(container)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .style('position', 'absolute')
      .style('top', '0')
      .style('left', '0');

    // Create particles
    const numParticles = 60;
    const nodes: ParticleNode[] = d3.range(numParticles).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
      radius: Math.random() * 4 + 2,
    }));

    // Create links between nearby particles
    const links: { source: number; target: number }[] = [];
    for (let i = 0; i < numParticles; i++) {
      for (let j = i + 1; j < numParticles; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200) {
          links.push({ source: i, target: j });
        }
      }
    }

    // Draw links
    const linkGroup = svg.append('g').attr('class', 'links');
    const linkElements = linkGroup
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', '#76A6BC')
      .attr('stroke-opacity', 0.15)
      .attr('stroke-width', 1);

    // Draw nodes
    const nodeGroup = svg.append('g').attr('class', 'nodes');
    const nodeElements = nodeGroup
      .selectAll('circle')
      .data(nodes)
      .join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => (d.radius > 3 ? '#76A6BC' : '#BFFF70'))
      .attr('opacity', 0.6);

    // Simulation
    const simulation = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2))
      .on('tick', () => {
        linkElements
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        nodeElements.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      });

    // Mouse interaction
    svg.on('mousemove', (event) => {
      const [mx, my] = d3.pointer(event);
      nodes.forEach((node: any) => {
        const dx = node.x - mx;
        const dy = node.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          node.vx += (dx / dist) * 2;
          node.vy += (dy / dist) * 2;
        }
      });
      simulation.alpha(0.3).restart();
    });

    // Resize handler
    const handleResize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      svg.attr('width', newWidth).attr('height', newHeight);
      simulation.force('center', d3.forceCenter(newWidth / 2, newHeight / 2));
      simulation.alpha(0.3).restart();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      simulation.stop();
      svg.remove();
    };
  }, []);

  return (
    <section className="hero">
      <div ref={canvasRef} className="hero-canvas" />
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            Available for Consulting
          </div>
          <h1 className="hero-title">
            Statistics &{' '}
            <span className="highlight">Data Science</span>
          </h1>
          <p className="hero-subtitle">
            Transforming complex data into clear, actionable insights.
            Specializing in statistical modeling, predictive analytics,
            and evidence-based research for impactful decision-making.
          </p>
          <div className="hero-btns">
            <a href="/portfolio" className="btn btn-primary">
              View Portfolio <FiArrowRight />
            </a>
            <a href="/dashboard" className="btn btn-outline">
              Live Dashboard <FiBarChart2 />
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-number">12+</div>
              <div className="hero-stat-label">Years Experience</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">150+</div>
              <div className="hero-stat-label">Projects Completed</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">45+</div>
              <div className="hero-stat-label">Publications</div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-number">98%</div>
              <div className="hero-stat-label">Client Satisfaction</div>
            </div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-graph-card glass-strong">
            <svg viewBox="0 0 400 250" style={{ width: '100%', height: 'auto' }}>
              {/* Animated line chart preview */}
              <defs>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#76A6BC" />
                  <stop offset="100%" stopColor="#BFFF70" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Grid lines */}
              {[50, 100, 150, 200].map((y) => (
                <line
                  key={y}
                  x1="40"
                  y1={y}
                  x2="380"
                  y2={y}
                  stroke="#ddd"
                  strokeWidth="0.5"
                  strokeDasharray="4,4"
                />
              ))}
              {/* Animated line */}
              <path
                d="M40,180 C100,160 160,120 220,100 C280,80 320,60 380,40"
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                filter="url(#glow)"
                strokeDasharray="500"
                strokeDashoffset="500"
              >
                <animate
                  attributeName="stroke-dashoffset"
                  from="500"
                  to="0"
                  dur="2s"
                  fill="freeze"
                />
              </path>
              {/* Data points */}
              {[
                { cx: 40, cy: 180 },
                { cx: 100, cy: 160 },
                { cx: 160, cy: 120 },
                { cx: 220, cy: 100 },
                { cx: 280, cy: 80 },
                { cx: 320, cy: 60 },
                { cx: 380, cy: 40 },
              ].map((p, i) => (
                <circle key={i} cx={p.cx} cy={p.cy} r="5" fill="#BFFF70" opacity="0">
                  <animate
                    attributeName="opacity"
                    from="0"
                    to="1"
                    begin={`${1.5 + i * 0.15}s`}
                    dur="0.3s"
                    fill="freeze"
                  />
                  <animate
                    attributeName="r"
                    values="0;7;5"
                    begin={`${1.5 + i * 0.15}s`}
                    dur="0.5s"
                    fill="freeze"
                  />
                </circle>
              ))}
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
