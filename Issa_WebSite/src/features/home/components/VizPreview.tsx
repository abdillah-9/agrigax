import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function VizPreview() {
  const barChartRef = useRef<HTMLDivElement>(null);
  const donutChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!barChartRef.current || !donutChartRef.current) return;

    // Read colors from CSS variables
    const styles = getComputedStyle(document.documentElement);
    const primaryColor = styles.getPropertyValue('--primary-base').trim() || '#76A6BC';
    const secondaryColor = styles.getPropertyValue('--secondary-base').trim() || '#BFFF70';
    const primaryDark = styles.getPropertyValue('--primary-dark').trim() || '#5C8DA3';
    const secondaryDark = styles.getPropertyValue('--secondary-dark').trim() || '#A3E055';
    const textMuted = styles.getPropertyValue('--text-muted').trim() || '#777777';
    const textSubtle = styles.getPropertyValue('--text-subtle').trim() || '#999999';
    const bgCard = styles.getPropertyValue('--bg-card').trim() || '#121212';

    // ---- BAR CHART ----
    const barContainer = barChartRef.current!;

    function drawBarChart() {
      // Clear previous
      d3.select(barContainer).selectAll('*').remove();

      const barWidth = barContainer.clientWidth;
      const barHeight = Math.min(300, barWidth * 0.85);
      const barMargin = {
        top: 20,
        right: 16,
        bottom: barWidth < 400 ? 60 : 50,
        left: barWidth < 400 ? 36 : 50,
      };

      const barData = [
        { label: 'Health', value: 35 },
        { label: 'Agriculture', value: 25 },
        { label: 'Finance', value: 20 },
        { label: 'Education', value: 15 },
        { label: 'Other', value: 5 },
      ];

      const barSvg = d3
        .select(barContainer)
        .append('svg')
        .attr('width', barWidth)
        .attr('height', barHeight)
        .attr('viewBox', `0 0 ${barWidth} ${barHeight}`);

      const x = d3
        .scaleBand()
        .domain(barData.map((d) => d.label))
        .range([barMargin.left, barWidth - barMargin.right])
        .padding(barWidth < 400 ? 0.3 : 0.4);

      const y = d3
        .scaleLinear()
        .domain([0, 40])
        .range([barHeight - barMargin.bottom, barMargin.top]);

      // Grid
      barSvg
        .append('g')
        .attr('transform', `translate(${barMargin.left},0)`)
        .call(
          d3.axisLeft(y).ticks(5).tickSize(-barWidth + barMargin.left + barMargin.right).tickFormat(() => '')
        )
        .attr('color', textSubtle)
        .attr('opacity', 0.15);

      // Axes
      barSvg
        .append('g')
        .attr('transform', `translate(0,${barHeight - barMargin.bottom})`)
        .call(d3.axisBottom(x))
        .selectAll('text')
        .attr('fill', textMuted)
        .attr('font-size', barWidth < 400 ? '9px' : '11px')
        .attr('transform', barWidth < 400 ? 'rotate(-30) translate(-6, 4)' : null)
        .attr('text-anchor', barWidth < 400 ? 'end' : 'middle');

      barSvg
        .append('g')
        .attr('transform', `translate(${barMargin.left},0)`)
        .call(d3.axisLeft(y).ticks(5))
        .selectAll('text')
        .attr('fill', textMuted)
        .attr('font-size', barWidth < 400 ? '9px' : '11px');

      // Bars
      barSvg
        .selectAll('rect')
        .data(barData)
        .join('rect')
        .attr('x', (d) => x(d.label)!)
        .attr('width', x.bandwidth())
        .attr('y', barHeight - barMargin.bottom)
        .attr('height', 0)
        .attr('fill', primaryColor)
        .attr('rx', barWidth < 400 ? 3 : 4)
        .attr('opacity', 0.85)
        .transition()
        .duration(1200)
        .delay((_, i) => i * 150)
        .attr('y', (d) => y(d.value))
        .attr('height', (d) => barHeight - barMargin.bottom - y(d.value));
    }

    // ---- DONUT CHART ----
    const donutContainer = donutChartRef.current!;

    function drawDonutChart() {
      d3.select(donutContainer).selectAll('*').remove();

      const donutWidth = donutContainer.clientWidth;
      const donutHeight = Math.min(300, donutWidth * 0.85);
      const radius = Math.min(donutWidth, donutHeight) / 2 - 20;

      const donutData = [
        { label: 'R', value: 40 },
        { label: 'Python', value: 30 },
        { label: 'Stata', value: 18 },
        { label: 'SPSS', value: 12 },
      ];

      const colors = [primaryColor, secondaryColor, primaryDark, secondaryDark];

      const donutSvg = d3
        .select(donutContainer)
        .append('svg')
        .attr('width', donutWidth)
        .attr('height', donutHeight)
        .attr('viewBox', `0 0 ${donutWidth} ${donutHeight}`)
        .append('g')
        .attr('transform', `translate(${donutWidth / 2},${donutHeight / 2})`);

      const pie = d3.pie<any>().value((d) => d.value);
      const arc = d3.arc<any>().innerRadius(radius * 0.6).outerRadius(radius);

      donutSvg
        .selectAll('path')
        .data(pie(donutData))
        .join('path')
        .attr('d', arc)
        .attr('fill', (_, i) => colors[i])
        .attr('stroke', bgCard)
        .attr('stroke-width', 2)
        .attr('opacity', 0)
        .transition()
        .duration(1000)
        .delay((_, i) => i * 200)
        .attr('opacity', 1);

      // Center text
      const labelSize = donutWidth < 350 ? '20px' : '28px';
      const subSize = donutWidth < 350 ? '10px' : '12px';

      donutSvg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.3em')
        .attr('font-size', labelSize)
        .attr('font-weight', '700')
        .attr('fill', primaryColor)
        .text('100%');

      donutSvg
        .append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .attr('font-size', subSize)
        .attr('fill', textSubtle)
        .text('Tool Proficiency');
    }

    // Initial draw
    drawBarChart();
    drawDonutChart();

    // Resize handler
    const handleResize = () => {
      drawBarChart();
      drawDonutChart();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <section className="viz-section" id="viz">
      <div className="container">
        <h2 className="section-title text-center reveal">Data at a Glance</h2>
        <p className="section-subtitle text-center reveal">
          Interactive visualizations showcasing analytical capabilities
        </p>
        <div className="viz-grid">
          <div className="viz-card reveal">
            <h3>Project Distribution by Sector</h3>
            <div ref={barChartRef} className="chart-container" />
          </div>
          <div className="viz-card reveal">
            <h3>Statistical Tool Proficiency</h3>
            <div ref={donutChartRef} className="chart-container" />
          </div>
        </div>
      </div>
    </section>
  );
}

export default VizPreview;
