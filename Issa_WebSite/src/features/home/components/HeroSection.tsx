import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { FiArrowRight, FiBarChart2 } from 'react-icons/fi';

interface ParticleNode extends d3.SimulationNodeDatum {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseRadius: number;
  phase: number;
  speed: number;
}

function HeroSection() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    const container = canvasRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    const styles = getComputedStyle(document.documentElement);
    const pc = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const sc = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';

    const svg = d3.select(container).append('svg')
      .attr('width', width).attr('height', height)
      .style('position', 'absolute').style('top', '0').style('left', '0');

    // INCREASED: 100 particles
    const numParticles = 100;
    const nodes: ParticleNode[] = d3.range(numParticles).map(() => {
      const baseR = Math.random() * 4 + 2;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: 0,
        vy: 0,
        radius: baseR,
        baseRadius: baseR,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
      };
    });

    const links: { source: number; target: number }[] = [];
    for (let i = 0; i < numParticles; i++) {
      for (let j = i + 1; j < numParticles; j++) {
        if (Math.hypot(nodes[i].x - nodes[j].x, nodes[i].y - nodes[j].y) < 180) {
          links.push({ source: i, target: j });
        }
      }
    }

    // Links with breathing opacity
    const linkElements = svg.append('g').selectAll('line').data(links).join('line')
      .attr('stroke', pc).attr('stroke-opacity', 0.1).attr('stroke-width', 0.7);

    // Nodes
    const nodeElements = svg.append('g').selectAll('circle').data(nodes).join('circle')
      .attr('r', (d) => d.radius)
      .attr('fill', (d) => (d.baseRadius > 3 ? pc : sc))
      .attr('opacity', 0.45);

    // Glow rings for larger nodes
    const glowRings = svg.append('g').selectAll('circle').data(nodes.filter((d) => d.baseRadius > 3.5)).join('circle')
      .attr('r', (d) => d.radius + 4)
      .attr('fill', 'none')
      .attr('stroke', pc)
      .attr('stroke-opacity', 0)
      .attr('stroke-width', 0.5);

    const simulation = d3.forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-70))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 2))
      .alphaDecay(0.02)
      .on('tick', () => {
        linkElements
          .attr('x1', (d: any) => d.source.x).attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x).attr('y2', (d: any) => d.target.y);
        nodeElements.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
        glowRings.attr('cx', (d: any) => d.x).attr('cy', (d: any) => d.y);
      });

    // BREATHING ANIMATION LOOP
    let breathTime = 0;
    const breathingInterval = setInterval(() => {
      breathTime += 0.03;
      nodeElements
        .attr('r', (d: any) => d.baseRadius + Math.sin(breathTime * d.speed * 40 + d.phase) * 1.2)
        .attr('opacity', (d: any) => 0.35 + Math.sin(breathTime * d.speed * 30 + d.phase) * 0.2);
      glowRings
        .attr('r', (d: any) => d.baseRadius + 4 + Math.sin(breathTime * d.speed * 40 + d.phase) * 2)
        .attr('stroke-opacity', (d: any) => Math.abs(Math.sin(breathTime * d.speed * 30 + d.phase)) * 0.12);
      linkElements
        .attr('stroke-opacity', 0.07 + Math.sin(breathTime * 0.8) * 0.04);
    }, 40);

    // MOUSE INTERACTION on hero background
    svg.on('mousemove', (event) => {
      const [mx, my] = d3.pointer(event);
      nodes.forEach((node: any) => {
        const dx = node.x - mx;
        const dy = node.y - my;
        const dist = Math.hypot(dx, dy);
        if (dist < 150) {
          node.vx += (dx / dist) * 2.5;
          node.vy += (dy / dist) * 2.5;
        }
      });
      simulation.alpha(0.3).restart();
    });

    // MOUSE INTERACTION on chart card too
    if (chartRef.current) {
      d3.select(chartRef.current).on('mousemove', (event) => {
        const rect = chartRef.current!.getBoundingClientRect();
        const mx = event.clientX - rect.left;
        const my = event.clientY - rect.top;
        // Map chart card coordinates to canvas coordinates
        const canvasRect = container.getBoundingClientRect();
        const offsetX = rect.left - canvasRect.left;
        const offsetY = rect.top - canvasRect.top;

        nodes.forEach((node: any) => {
          const dx = node.x - (mx + offsetX);
          const dy = node.y - (my + offsetY);
          const dist = Math.hypot(dx, dy);
          if (dist < 200) {
            node.vx += (dx / dist) * 3;
            node.vy += (dy / dist) * 3;
          }
        });
        simulation.alpha(0.35).restart();
      });
    }

    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      svg.attr('width', w).attr('height', h);
      simulation.force('center', d3.forceCenter(w / 2, h / 2)).alpha(0.3).restart();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearInterval(breathingInterval);
      simulation.stop();
      svg.remove();
    };
  }, []);

  // Hero scatter chart — fixed padding
  useEffect(() => {
    if (!chartRef.current) return;
    const container = chartRef.current;
    const w = container.clientWidth;
    const h = 280;
    const margin = { top: 25, right: 25, bottom: 40, left: 45 };
    const styles = getComputedStyle(document.documentElement);
    const pc = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const sc = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';
    const tm = styles.getPropertyValue('--text-muted').trim() || '#777';

    const svg = d3.select(container).append('svg')
      .attr('viewBox', `0 0 ${w} ${h}`)
      .attr('width', '100%')
      .attr('height', '100%')
      .style('display', 'block');

    // Clip path to prevent overflow
    svg.append('defs').append('clipPath').attr('id', 'chartClip')
      .append('rect')
      .attr('x', margin.left - 10)
      .attr('y', margin.top - 10)
      .attr('width', w - margin.left - margin.right + 20)
      .attr('height', h - margin.top - margin.bottom + 20);

    const chartArea = svg.append('g').attr('clip-path', 'url(#chartClip)');

    // Grid lines
    const gridLines = [25, 50, 75, 100];
    gridLines.forEach((val) => {
      const x = margin.left + (val / 100) * (w - margin.left - margin.right);
      const y = margin.top + ((100 - val) / 100) * (h - margin.top - margin.bottom);
      chartArea.append('line')
        .attr('x1', margin.left).attr('y1', y)
        .attr('x2', w - margin.right).attr('y2', y)
        .attr('stroke', tm).attr('stroke-opacity', 0).attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '4,4')
        .transition().delay(200).duration(400).attr('stroke-opacity', 0.12);
      chartArea.append('line')
        .attr('x1', x).attr('y1', margin.top)
        .attr('x2', x).attr('y2', h - margin.bottom)
        .attr('stroke', tm).attr('stroke-opacity', 0).attr('stroke-width', 0.5)
        .attr('stroke-dasharray', '4,4')
        .transition().delay(200).duration(400).attr('stroke-opacity', 0.12);
    });

    // Axis lines
    chartArea.append('line')
      .attr('x1', margin.left).attr('y1', h - margin.bottom)
      .attr('x2', w - margin.right).attr('y2', h - margin.bottom)
      .attr('stroke', tm).attr('stroke-opacity', 0).attr('stroke-width', 1)
      .transition().delay(200).duration(600).attr('stroke-opacity', 0.25);
    chartArea.append('line')
      .attr('x1', margin.left).attr('y1', margin.top)
      .attr('x2', margin.left).attr('y2', h - margin.bottom)
      .attr('stroke', tm).attr('stroke-opacity', 0).attr('stroke-width', 1)
      .transition().delay(200).duration(600).attr('stroke-opacity', 0.25);

    // Axis labels
    svg.append('text')
      .attr('x', margin.left + (w - margin.left - margin.right) / 2)
      .attr('y', h - 6)
      .attr('text-anchor', 'middle')
      .attr('font-size', '10px').attr('fill', tm).attr('opacity', 0)
      .text('Variable X')
      .transition().delay(800).duration(400).attr('opacity', 0.5);

    svg.append('text')
      .attr('x', 12).attr('y', margin.top + (h - margin.top - margin.bottom) / 2)
      .attr('text-anchor', 'middle')
      .attr('transform', `rotate(-90, 12, ${margin.top + (h - margin.top - margin.bottom) / 2})`)
      .attr('font-size', '10px').attr('fill', tm).attr('opacity', 0)
      .text('Variable Y')
      .transition().delay(800).duration(400).attr('opacity', 0.5);

    // Scatter data
    const data = d3.range(35).map(() => {
      const baseX = Math.random() * 100;
      const baseY = baseX * 0.7 + (Math.random() - 0.5) * 40;
      return {
        x: Math.max(5, Math.min(95, baseX)),
        y: Math.max(5, Math.min(95, baseY)),
        r: Math.random() * 5 + 3,
      };
    });

    const xScale = d3.scaleLinear()
      .domain([0, 100])
      .range([margin.left, w - margin.right]);
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([h - margin.bottom, margin.top]);

    data.forEach((d, i) => {
      const color = i % 3 === 0 ? sc : pc;

      chartArea.append('circle')
        .attr('cx', xScale(d.x)).attr('cy', yScale(d.y)).attr('r', 0)
        .attr('fill', color).attr('opacity', 0)
        .transition().delay(400 + i * 60).duration(500)
        .attr('r', d.r).attr('opacity', 0.7);

      chartArea.append('circle')
        .attr('cx', xScale(d.x)).attr('cy', yScale(d.y)).attr('r', d.r)
        .attr('fill', 'none').attr('stroke', color).attr('stroke-opacity', 0)
        .transition().delay(1200 + i * 80).duration(2000)
        .attr('r', d.r + 8).attr('stroke-opacity', 0)
        .transition().duration(1000)
        .attr('r', d.r).attr('stroke-opacity', 0)
        .on('end', function repeat(this: any) {
          d3.select(this)
            .transition().duration(2000)
            .attr('r', d.r + 8).attr('stroke-opacity', 0.25)
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
