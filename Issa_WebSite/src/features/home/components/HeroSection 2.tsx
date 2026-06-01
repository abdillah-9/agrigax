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

    const svg = d3.select(container).append('svg')
      .attr('width', width).attr('height', height)
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

    // Subtle axis lines
    svg.append('line').attr('x1', 40).attr('y1', h - 40).attr('x2', w - 20).attr('y2', h - 40)
      .attr('stroke', tm).attr('stroke-opacity', 0).attr('stroke-width', 1)
      .transition().delay(200).duration(600).attr('stroke-opacity', 0.2);
    svg.append('line').attr('x1', 40).attr('y1', 20).attr('x2', 40).attr('y2', h - 40)
      .attr('stroke', tm).attr('stroke-opacity', 0).attr('stroke-width', 1)
      .transition().delay(200).duration(600).attr('stroke-opacity', 0.2);

    // Axis labels
    svg.append('text').attr('x', w / 2).attr('y', h - 8).attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', tm).attr('opacity', 0)
      .text('Variable X').transition().delay(800).duration(400).attr('opacity', 0.6);
    svg.append('text').attr('x', 15).attr('y', h / 2).attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90, 15, ${h / 2})`)
      .attr('font-size', '10px').attr('fill', tm).attr('opacity', 0)
      .text('Variable Y').transition().delay(800).duration(400).attr('opacity', 0.6);

    // Generate scatter data with correlation pattern
    const data = d3.range(35).map(() => {
      const baseX = Math.random() * 100;
      const baseY = baseX * 0.7 + (Math.random() - 0.5) * 40;
      return { x: Math.max(0, Math.min(100, baseX)), y: Math.max(0, Math.min(100, baseY)), r: Math.random() * 5 + 3 };
    });

    const xScale = d3.scaleLinear().domain([0, 100]).range([55, w - 35]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([h - 55, 35]);

    // Draw dots with staggered animation
    data.forEach((d, i) => {
      const color = i % 3 === 0 ? sc : pc;
      svg.append('circle')
        .attr('cx', xScale(d.x)).attr('cy', yScale(d.y)).attr('r', 0)
        .attr('fill', color).attr('opacity', 0)
        .transition().delay(400 + i * 60).duration(500)
        .attr('r', d.r).attr('opacity', 0.7);

      // Pulsing animation
      svg.append('circle')
        .attr('cx', xScale(d.x)).attr('cy', yScale(d.y)).attr('r', d.r)
        .attr('fill', 'none').attr('stroke', color).attr('stroke-opacity', 0)
        .transition().delay(1200 + i * 80).duration(2000)
        .attr('r', d.r + 8).attr('stroke-opacity', 0)
        .transition().duration(1000)
        .attr('r', d.r).attr('stroke-opacity', 0)
        .on('end', function repeat(this: any) {
          d3.select(this).transition().duration(2000)
            .attr('r', d.r + 8).attr('stroke-opacity', 0.3)
            .transition().duration(1000)
            .attr('r', d.r).attr('stroke-opacity', 0)
            .on('end', repeat);
        });
    });

    return () => { svg.remove(); };
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
