import { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { FiUsers, FiTrendingUp, FiTarget, FiActivity } from 'react-icons/fi';
import '../styles/dashboard.css';

function Dashboard() {
  const lineChartRef = useRef<HTMLDivElement>(null);
  const scatterRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const animationRef = useRef<number>(0);

  const [kpis] = useState([
    { icon: <FiUsers />, iconClass: 'blue', value: '12,847', label: 'Total Observations' },
    { icon: <FiTrendingUp />, iconClass: 'lime', value: '94.7%', label: 'Model Accuracy' },
    { icon: <FiTarget />, iconClass: 'blue', value: '38', label: 'Active Projects' },
    { icon: <FiActivity />, iconClass: 'lime', value: '2.4M', label: 'Computations/sec' },
  ]);

  const getColors = useCallback(() => {
    const styles = getComputedStyle(document.documentElement);
    return {
      primary: styles.getPropertyValue('--primary-base').trim() || '#76A6BC',
      secondary: styles.getPropertyValue('--secondary-base').trim() || '#BFFF70',
      primaryDark: styles.getPropertyValue('--primary-dark').trim() || '#5C8DA3',
      textMuted: styles.getPropertyValue('--text-muted').trim() || '#777777',
      textSubtle: styles.getPropertyValue('--text-subtle').trim() || '#999999',
    };
  }, []);

  const generateData = useCallback(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const lineData = months.map((m, i) => ({
      month: m,
      consulting: 20 + Math.sin(i * 0.5) * 15 + Math.random() * 10,
      research: 15 + Math.cos(i * 0.6) * 12 + Math.random() * 8,
      training: 10 + Math.sin(i * 0.4 + 1) * 8 + Math.random() * 6,
    }));

    const scData = d3.range(50).map(() => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 5 + 2,
      vx: (Math.random() - 0.5) * 0.08,
      vy: (Math.random() - 0.5) * 0.08,
    }));

    const barData = [
      'Health', 'Agriculture', 'Finance', 'Education',
      'Environment', 'Governance', 'Technology', 'Social',
    ].map((d) => ({ label: d, value: Math.floor(Math.random() * 40) + 10 }));

    return { lineData, scData, barData };
  }, []);

  useEffect(() => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const data = generateData();
    const colors = getColors();
    let breathTime = 0;

    const isSmall = window.innerWidth < 500;
    const dotBaseR = isSmall ? 3 : 4;

    // ---- LINE CHART ----
    const drawLineChart = () => {
      if (!lineChartRef.current) return null;
      const container = lineChartRef.current;
      d3.select(container).selectAll('*').remove();

      const w = container.clientWidth;
      const h = Math.min(320, w * 0.75);
      const margin = { top: 20, right: isSmall ? 12 : 30, bottom: 45, left: isSmall ? 38 : 55 };

      const svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', `0 0 ${w} ${h}`);

      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const xLine = d3.scalePoint().domain(months).range([margin.left, w - margin.right]);
      const yLine = d3.scaleLinear().domain([0, 55]).range([h - margin.bottom, margin.top]);

      // Grid
      svg.append('g').attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yLine).ticks(5).tickSize(-w + margin.left + margin.right).tickFormat(() => ''))
        .attr('color', colors.textSubtle).attr('opacity', 0.1);

      // Axes
      svg.append('g').attr('transform', `translate(0,${h - margin.bottom})`)
        .call(d3.axisBottom(xLine))
        .selectAll('text').attr('fill', colors.textMuted)
        .attr('font-size', isSmall ? '8px' : '11px');

      svg.append('g').attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yLine).ticks(5))
        .selectAll('text').attr('fill', colors.textMuted)
        .attr('font-size', isSmall ? '8px' : '11px');

      const series = ['consulting', 'research', 'training'] as const;
      const seriesColors = [colors.primary, colors.secondary, colors.primaryDark];

      series.forEach((s, idx) => {
        const line = d3.line<{ month: string; consulting: number; research: number; training: number }>()
          .x((d) => xLine(d.month)!).y((d) => yLine(d[s])).curve(d3.curveCatmullRom);

        const path = svg.append('path').datum(data.lineData).attr('d', line)
          .attr('fill', 'none').attr('stroke', seriesColors[idx]).attr('stroke-width', 2);

        const totalLength = (path.node() as SVGPathElement)?.getTotalLength() || 0;
        path.attr('stroke-dasharray', totalLength).attr('stroke-dashoffset', totalLength)
          .transition().duration(1800).delay(idx * 250).attr('stroke-dashoffset', 0);

        svg.selectAll(`dot-${s}`).data(data.lineData).join('circle')
          .attr('cx', (d) => xLine(d.month)!).attr('cy', (d) => yLine(d[s]))
          .attr('r', 0).attr('fill', seriesColors[idx]).attr('class', `pulse-dot pulse-${s}`)
          .attr('data-base-r', dotBaseR)
          .transition().duration(400).delay((_, i) => 1800 + idx * 250 + i * 70)
          .attr('r', dotBaseR);
      });

      // Legend
      const legendData = [
        { label: 'Consulting', color: colors.primary },
        { label: 'Research', color: colors.secondary },
        { label: 'Training', color: colors.primaryDark },
      ];
      const lx = w - (isSmall ? 100 : 150);
      const legend = svg.append('g').attr('transform', `translate(${lx}, ${isSmall ? 4 : 10})`);
      legendData.forEach((d, i) => {
        const g = legend.append('g').attr('transform', `translate(0, ${i * 18})`);
        g.append('circle').attr('r', 3).attr('fill', d.color).attr('class', 'legend-dot');
        g.append('text').attr('x', 8).attr('y', 3)
          .attr('font-size', isSmall ? '9px' : '10px')
          .attr('fill', colors.textMuted).text(d.label);
      });

      return svg;
    };

    // ---- SCATTER PLOT ----
    const drawScatterPlot = () => {
      if (!scatterRef.current) return null;
      const container = scatterRef.current;
      d3.select(container).selectAll('*').remove();

      const w = container.clientWidth;
      const h = Math.min(320, w * 0.75);
      const margin = { top: 20, right: 12, bottom: 38, left: isSmall ? 35 : 45 };

      const svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', `0 0 ${w} ${h}`);

      const xSc = d3.scaleLinear().domain([0, 100]).range([margin.left, w - margin.right]);
      const ySc = d3.scaleLinear().domain([0, 100]).range([h - margin.bottom, margin.top]);

      svg.append('g').attr('transform', `translate(0,${h - margin.bottom})`)
        .call(d3.axisBottom(xSc).ticks(4))
        .selectAll('text').attr('fill', colors.textMuted).attr('font-size', isSmall ? '8px' : '10px');

      svg.append('g').attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(ySc).ticks(4))
        .selectAll('text').attr('fill', colors.textMuted).attr('font-size', isSmall ? '8px' : '10px');

      svg.selectAll('circle').data(data.scData).join('circle')
        .attr('cx', (d) => xSc(d.x)).attr('cy', (d) => ySc(d.y))
        .attr('r', 0).attr('fill', colors.primary).attr('opacity', 0.4)
        .attr('class', 'drift-dot')
        .transition().duration(600).delay((_, i) => i * 20)
        .attr('r', (d) => d.r);

      return { svg, xSc, ySc, scData: data.scData };
    };

    // ---- BAR CHART ----
    const drawBarChart = () => {
      if (!barChartRef.current) return null;
      const container = barChartRef.current;
      d3.select(container).selectAll('*').remove();

      const w = container.clientWidth;
      const h = Math.min(320, w * 0.75);
      const margin = { top: 20, right: 12, bottom: isSmall ? 60 : 50, left: isSmall ? 35 : 45 };

      const svg = d3.select(container).append('svg')
        .attr('width', w).attr('height', h)
        .attr('viewBox', `0 0 ${w} ${h}`);

      const xBar = d3.scaleBand().domain(data.barData.map((d) => d.label))
        .range([margin.left, w - margin.right]).padding(isSmall ? 0.2 : 0.3);
      const yBar = d3.scaleLinear().domain([0, 55]).range([h - margin.bottom, margin.top]);

      svg.append('g').attr('transform', `translate(0,${h - margin.bottom})`)
        .call(d3.axisBottom(xBar))
        .selectAll('text').attr('fill', colors.textMuted)
        .attr('font-size', isSmall ? '7px' : '10px')
        .attr('transform', isSmall ? 'rotate(-35) translate(-6, 3)' : 'rotate(-25)')
        .attr('text-anchor', 'end');

      svg.append('g').attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yBar).ticks(4))
        .selectAll('text').attr('fill', colors.textMuted).attr('font-size', isSmall ? '8px' : '10px');

      svg.selectAll('rect').data(data.barData).join('rect')
        .attr('x', (d) => xBar(d.label)!).attr('width', xBar.bandwidth())
        .attr('y', h - margin.bottom).attr('height', 0)
        .attr('fill', colors.secondary).attr('rx', isSmall ? 3 : 4).attr('opacity', 0.85)
        .attr('class', 'breathe-bar')
        .attr('data-height', (d) => h - margin.bottom - yBar(d.value))
        .attr('data-y', (d) => yBar(d.value))
        .transition().duration(800).delay((_, i) => i * 80)
        .attr('y', (d) => yBar(d.value))
        .attr('height', (d) => h - margin.bottom - yBar(d.value));

      return svg;
    };

    drawLineChart();
    const scatterObjs = drawScatterPlot();
    drawBarChart();

    // ---- SUBTLE ANIMATION LOOP ----
    function animate() {
      breathTime += 0.02;

      // 1. Subtle dot pulse — max ±0.6px, opacity ±0.15
      d3.selectAll('.pulse-dot').each(function () {
        const baseR = parseFloat(d3.select(this).attr('data-base-r') || String(dotBaseR));
        d3.select(this)
          .attr('r', baseR + Math.sin(breathTime * 2.5) * 0.6)
          .attr('opacity', 0.7 + Math.sin(breathTime * 2.5) * 0.15);
      });

      // 2. Subtle legend pulse
      d3.selectAll('.legend-dot')
        .attr('opacity', 0.75 + Math.sin(breathTime * 1.8) * 0.15);

      // 3. Slow scatter drift
      if (scatterObjs) {
        const { xSc, ySc, scData } = scatterObjs;
        scData.forEach((d: any) => {
          d.x += d.vx;
          d.y += d.vy;
          if (d.x < 0 || d.x > 100) d.vx *= -1;
          if (d.y < 0 || d.y > 100) d.vy *= -1;
        });
        d3.selectAll('.drift-dot')
          .attr('cx', (d: any) => xSc(d.x))
          .attr('cy', (d: any) => ySc(d.y));
      }

      // 4. Gentle bar breathe — max ±2px height, opacity ±0.08
      d3.selectAll('.breathe-bar').each(function () {
        const baseY = parseFloat(d3.select(this).attr('data-y') || '0');
        const baseH = parseFloat(d3.select(this).attr('data-height') || '0');
        const wave = Math.sin(breathTime * 1.8) * 2;
        d3.select(this)
          .attr('y', baseY + wave * 0.4)
          .attr('height', baseH - wave * 0.4)
          .attr('opacity', 0.8 + Math.sin(breathTime * 2) * 0.08);
      });

      animationRef.current = requestAnimationFrame(animate);
    }

    setTimeout(() => {
      animationRef.current = requestAnimationFrame(animate);
    }, 2200);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [refreshKey, generateData, getColors]);

  const handleExportPDF = () => {
    window.print();
  };

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="dashboard-page" id="dashboard-content">
      <div className="dashboard-header">
        <h1>
          Interactive <span className="highlight">Dashboard</span>
        </h1>
        <div className="dashboard-controls">
          <button className="dashboard-control-btn active">Last 12 Months</button>
          <button className="dashboard-control-btn" onClick={handleExportPDF}>
            Export PDF
          </button>
          <button className="dashboard-control-btn" onClick={handleRefresh}>
            Refresh Data
          </button>
        </div>
      </div>

      <div className="kpi-grid">
        {kpis.map((kpi, i) => (
          <div key={i} className="kpi-card">
            <div className={`kpi-icon ${kpi.iconClass}`}>{kpi.icon}</div>
            <div className="kpi-info">
              <h3>{kpi.value}</h3>
              <p>{kpi.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="chart-row">
        <div className="chart-card">
          <h3>Monthly Activity Trends</h3>
          <div ref={lineChartRef} className="chart-container" />
        </div>
        <div className="chart-card">
          <h3>Correlation Matrix</h3>
          <div ref={scatterRef} className="chart-container" />
        </div>
      </div>

      <div className="chart-row chart-row-full">
        <div className="chart-card">
          <h3>Project Distribution by Sector</h3>
          <div ref={barChartRef} className="chart-container" />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
