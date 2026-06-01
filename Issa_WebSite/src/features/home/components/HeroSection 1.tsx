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
  const chartRef = useRef<HTMLDivElement>(null);

  // Background particle network
  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const secondaryColor = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';

    const svg = d3.select(container).append('svg')
      .attr('width', width).attr('height', height)
      .style('position', 'absolute').style('top', '0').style('left', '0');

    const numParticles = 60;
    const nodes: ParticleNode[] = d3.range(numParticles).map(() => ({
      x: Math.random() * width, y: Math.random() * height,
      vx: 0, vy: 0, radius: Math.random() * 4 + 2,
    }));

    const links: { source: number; target: number }[] = [];
    for (let i = 0; i < numParticles; i++) {
      for (let j = i + 1; j < numParticles; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        if (Math.sqrt(dx * dx + dy * dy) < 200) links.push({ source: i, target: j });
      }
    }

    const linkElements = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', primaryColor).attr('stroke-opacity', 0.12).attr('stroke-width', 0.8);

    const nodeElements = svg.append('g').selectAll('circle').data(nodes).join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => (d.radius > 3 ? primaryColor : secondaryColor))
      .attr('opacity', 0.5);

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2))
      .on('tick', () => {
        linkElements.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
        nodeElements.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      });

    svg.on('mousemove', (event) => {
      const [mx, my] = d3.pointer(event);
      nodes.forEach((node: any) => {
        const dx = node.x - mx, dy = node.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) { node.vx += (dx / dist) * 2; node.vy += (dy / dist) * 2; }
      });
      simulation.alpha(0.3).restart();
    });

    const handleResize = () => {
      const w = container.clientWidth, h = container.clientHeight;
      svg.attr('width', w).attr('height', h);
      simulation.force('center', d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); simulation.stop(); svg.remove(); };
  }, []);

  // Hero chart card
  useEffect(() => {
    if (!chartRef.current) return;
    const container = chartRef.current;
    const w = container.clientWidth;
    const h = 280;
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const secondaryColor = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';
    const textSubtle = styles.getPropertyValue('--text-subtle').trim() || '#999';

    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${w} ${h}`)
      .attr('width', w).attr('height', h);

    // Animated grid
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient').attr('id', 'lineGrad1').attr('x1', '0%').attr('y1', '0%').attr('x2', '100%').attr('y2', '0%');
    gradient.append('stop').attr('offset', '0%').attr('stop-color', primaryColor);
    gradient.append('stop').attr('offset', '100%').attr('stop-color', secondaryColor);

    const glow = defs.append('filter').attr('id', 'glow1');
    glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Grid lines with fade-in
    const gridLines = [60, 100, 140, 180, 220];
    gridLines.forEach((y, i) => {
      svg.append('line')
        .attr('x1', 40).attr('y1', y).attr('x2', w - 20).attr('y2', y)
        .attr('stroke', textSubtle).attr('stroke-opacity', 0)
        .attr('stroke-width', 0.5).attr('stroke-dasharray', '4,4')
        .transition().delay(300 + i * 100).duration(400)
        .attr('stroke-opacity', 0.15);
    });

    // Main trend line
    const linePath = 'M40,200 C100,170 160,130 220,100 C280,70 340,55 380,45';
    svg.append('path')
      .attr('d', linePath).attr('fill', 'none')
      .attr('stroke', 'url(#lineGrad1)').attr('stroke-width', 3)
      .attr('filter', 'url(#glow1)')
      .attr('stroke-dasharray', '600').attr('stroke-dashoffset', '600')
      .transition().duration(2000).ease(d3.easeCubicInOut)
      .attr('stroke-dashoffset', '0');

    // Second subtle line
    const line2 = 'M40,220 C140,200 200,170 260,140 C320,110 360,95 380,85';
    svg.append('path')
      .attr('d', line2).attr('fill', 'none')
      .attr('stroke', primaryColor).attr('stroke-width', 1.2)
      .attr('stroke-opacity', 0).attr('stroke-dasharray', '8,4')
      .transition().delay(800).duration(1500)
      .attr('stroke-opacity', 0.3);

    // Data dots
    const points = [
      { x: 40, y: 200 }, { x: 100, y: 170 }, { x: 160, y: 130 },
      { x: 220, y: 100 }, { x: 280, y: 70 }, { x: 340, y: 55 }, { x: 380, y: 45 },
    ];

    points.forEach((p, i) => {
      // Outer glow ring
      svg.append('circle')
        .attr('cx', p.x).attr('cy', p.y).attr('r', 0)
        .attr('fill', 'none').attr('stroke', secondaryColor)
        .attr('stroke-width', 2).attr('stroke-opacity', 0)
        .transition().delay(1800 + i * 150).duration(600)
        .attr('r', 10).attr('stroke-opacity', 0.4)
        .transition().duration(400)
        .attr('r', 6).attr('stroke-opacity', 0);

      // Main dot
      svg.append('circle')
        .attr('cx', p.x).attr('cy', p.y).attr('r', 0)
        .attr('fill', secondaryColor).attr('opacity', 0)
        .transition().delay(1800 + i * 150).duration(400)
        .attr('r', 5).attr('opacity', 1);

      // Value label
      const values = ['2.1', '3.4', '4.8', '6.2', '7.5', '8.9', '9.7'];
      svg.append('text')
        .attr('x', p.x).attr('y', p.y - 16)
        .attr('text-anchor', 'middle')
        .attr('font-size', '10px').attr('font-weight', '600')
        .attr('fill', textSubtle).attr('opacity', 0)
        .text(values[i])
        .transition().delay(2200 + i * 150).duration(400)
        .attr('opacity', 1);
    });

    return () => { svg.remove(); };
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
          <div className="hero-graph-card" ref={chartRef} />
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
