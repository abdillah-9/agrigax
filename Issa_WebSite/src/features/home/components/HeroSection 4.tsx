import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FiArrowRight, FiBarChart2 } from 'react-icons/fi';

interface ParticleNode extends d3.SimulationNodeDatum {
  x: number; y: number; vx: number; vy: number; radius: number;
}

function HeroSection() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth, height = container.clientHeight;
    const styles = getComputedStyle(document.documentElement);
    const pc = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const sc = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';

    const svg = d3.select(container).append('svg').attr('width', width).attr('height', height)
      .style('position', 'absolute').style('top', '0').style('left', '0');
    const numParticles = 60;
    const nodes: ParticleNode[] = d3.range(numParticles).map(() => ({
      x: Math.random() * width, y: Math.random() * height, vx: 0, vy: 0, radius: Math.random() * 4 + 2,
    }));
    const links: { source: number; target: number }[] = [];
    for (let i = 0; i < numParticles; i++)
      for (let j = i + 1; j < numParticles; j++)
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 200)
          links.push({ source: i, target: j });

    const le = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', pc).attr('stroke-opacity', 0.12).attr('stroke-width', 0.8);
    const ne = svg.append('g').selectAll('circle').data(nodes).join('circle')
      .attr('r', (d) => d.radius).attr('fill', (d) => (d.radius > 3 ? pc : sc)).attr('opacity', 0.5);
    const sim = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-80))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2))
      .on('tick', () => {
        le.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
        ne.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      });
    svg.on('mousemove', (event) => {
      const [mx, my] = d3.pointer(event);
      nodes.forEach((n: any) => {
        const dx = n.x - mx, dy = n.y - my, dist = Math.hypot(dx, dy);
        if (dist < 150) { n.vx += (dx / dist) * 2; n.vy += (dy / dist) * 2; }
      });
      sim.alpha(0.3).restart();
    });
    const hr = () => { const w = container.clientWidth, h = container.clientHeight; svg.attr('width', w).attr('height', h); sim.force('center', d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart(); };
    window.addEventListener('resize', hr);
    return () => { window.removeEventListener('resize', hr); sim.stop(); svg.remove(); };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    const container = chartRef.current;
    const w = container.clientWidth, h = 280;
    const styles = getComputedStyle(document.documentElement);
    const pc = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const sc = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';
    const tm = styles.getPropertyValue('--text-muted').trim() || '#777';

    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${w} ${h}`).attr('width', w).attr('height', h);

    // Mini network inside card
    const numNodes = 18;
    const nodes: any[] = d3.range(numNodes).map((i) => ({
      id: i, radius: Math.random() * 6 + 3,
      isPrimary: i % 3 !== 0,
    }));

    const links: { source: any; target: any }[] = [];
    for (let i = 0; i < numNodes; i++)
      for (let j = i + 1; j < numNodes; j++)
        if (Math.random() < 0.25) links.push({ source: nodes[i], target: nodes[j] });

    // Draw links
    const linkEls = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', pc).attr('stroke-opacity', 0.15).attr('stroke-width', 1);

    // Draw nodes
    const nodeEls = svg.append('g').selectAll('circle').data(nodes).join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => d.isPrimary ? pc : sc)
      .attr('opacity', 0)
      .attr('filter', 'url(#glow4)');

    // Glow filter
    const defs = svg.append('defs');
    const glow = defs.append('filter').attr('id', 'glow4');
    glow.append('feGaussianBlur').attr('stdDeviation', '2').attr('result', 'blur');
    const merge = glow.append('feMerge');
    merge.append('feMergeNode').attr('in', 'blur');
    merge.append('feMergeNode').attr('in', 'SourceGraphic');

    // Simulation for card network
    const cardSim = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-60))
      .force('center', d3.forceCenter(w / 2, h / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 4))
      .on('tick', () => {
        linkEls.attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
        nodeEls.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      });

    // Fade in nodes
    nodeEls.transition().delay((_, i) => i * 100).duration(600).attr('opacity', 0.75);

    // Center label
    svg.append('text')
      .attr('x', w / 2).attr('y', h / 2).attr('text-anchor', 'middle')
      .attr('font-size', '16px').attr('font-weight', '800').attr('fill', tm).attr('opacity', 0)
      .text('Network Analysis')
      .transition().delay(1500).duration(600).attr('opacity', 0.8);

    svg.append('text')
      .attr('x', w / 2).attr('y', h / 2 + 22).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', tm).attr('opacity', 0)
      .text('Connected Data Ecosystems')
      .transition().delay(1800).duration(600).attr('opacity', 0.5);

    // Continuous gentle movement
    let time = 0;
    const interval = setInterval(() => {
      time += 0.02;
      nodes.forEach((n: any) => {
        n.vx = (n.vx || 0) + Math.sin(time + n.id) * 0.1;
        n.vy = (n.vy || 0) + Math.cos(time + n.id) * 0.1;
      });
      cardSim.alpha(0.1).restart();
    }, 50);

    return () => { clearInterval(interval); cardSim.stop(); svg.remove(); };
  }, []);

  return (
    <section className="hero">
      <div ref={canvasRef} className="hero-canvas" />
      <div className="hero-content">
        <div className="hero-text">
          <div className="hero-badge"><span className="hero-badge-dot" />Available for Consulting</div>
          <h1 className="hero-title">Statistics & <span className="highlight">Data Science</span></h1>
          <p className="hero-subtitle">Transforming complex data into clear, actionable insights. Specializing in statistical modeling, predictive analytics, and evidence-based research for impactful decision-making.</p>
          <div className="hero-btns">
            <a href="/portfolio" className="btn btn-primary">View Portfolio <FiArrowRight /></a>
            <a href="/dashboard" className="btn btn-outline">Live Dashboard <FiBarChart2 /></a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat"><div className="hero-stat-number">12+</div><div className="hero-stat-label">Years Experience</div></div>
            <div className="hero-stat"><div className="hero-stat-number">150+</div><div className="hero-stat-label">Projects Completed</div></div>
            <div className="hero-stat"><div className="hero-stat-number">45+</div><div className="hero-stat-label">Publications</div></div>
            <div className="hero-stat"><div className="hero-stat-number">98%</div><div className="hero-stat-label">Client Satisfaction</div></div>
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
