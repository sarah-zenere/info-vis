import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

const Heatmap = ({ data, onGenreHover }) => {
  const svgRef = useRef();
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, content: '' });

  useEffect(() => {
    if (data.length === 0) return;

    const genresByYear = processData(data);
    drawHeatmap(genresByYear);
  }, [data]);

  const processData = (data) => {
    const genresByYear = {};

    data.forEach((anime) => {
      const years = extractYears(anime.Aired);
      const genres = anime.Genres || [];
      if (genres.length === 0) return;

      const rating = anime.Rating;
      genres.forEach((genre) => {
        years.forEach((year) => {
          if (!genresByYear[year]) genresByYear[year] = {};
          if (!genresByYear[year][genre]) genresByYear[year][genre] = [];
          genresByYear[year][genre].push(rating);
        });
      });
    });

    for (const year in genresByYear) {
      for (const genre in genresByYear[year]) {
        const ratings = genresByYear[year][genre];
        genresByYear[year][genre] = ratings.reduce((a, b) => a + b, 0) / ratings.length;
      }
    }

    return genresByYear;
  };

  const extractYears = (aired) => {
    if (!aired) return [];
    const years = aired.split('to').map((date) => new Date(date.trim()).getFullYear());
    const startYear = years[0];
    const endYear = years[1];
    const yearsInRange = [];
    for (let year = startYear; year <= endYear; year++) {
      yearsInRange.push(year);
    }
    return yearsInRange;
  };

  const drawHeatmap = (genresByYear) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
  
    const margin = { top: 60, right: 20, bottom: 100, left: 120 };
    const width = svg.node().clientWidth - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;
  
    const years = Array.from({ length: 2024 - 1960 + 1 }, (_, i) => 1960 + i);
    const genres = Array.from(
      new Set(Object.values(genresByYear).flatMap((yearData) => Object.keys(yearData)))
    );
  
    const xScale = d3.scaleBand().domain(years).range([0, width]).padding(0.1);
    const yScale = d3.scaleBand().domain(genres).range([0, height]).padding(0.05);
  
    // Updated Color Scale: Light red to dark red (same as heatmap)
    const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 10]);
  
    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);
  
    g.selectAll('.cell')
      .data(Object.entries(genresByYear).flatMap(([year, genreData]) =>
        Object.entries(genreData).map(([genre, avgRating]) => ({
          year: parseInt(year),
          genre,
          rating: avgRating,
        }))
      ))
      .enter()
      .append('rect')
      .attr('class', 'cell')
      .attr('x', (d) => xScale(d.year))
      .attr('y', (d) => yScale(d.genre))
      .attr('width', xScale.bandwidth())
      .attr('height', yScale.bandwidth())
      .attr('fill', (d) => colorScale(d.rating))
      .on('mouseover', (event, d) => {
        onGenreHover(d.genre);
        setTooltip({
          visible: true,
          x: event.clientX + 10,
          y: event.clientY - 10,
          content: `Genre: ${d.genre}\nYear: ${d.year}\nRating: ${d.rating.toFixed(2)}`,
        });
        d3.select(event.target).attr('stroke', '#333').attr('stroke-width', 2);  // Highlight the cell
      })
      .on('mousemove', (event) => {
        setTooltip((prevTooltip) => ({
          ...prevTooltip,
          x: event.clientX + 10, // update position
          y: event.clientY - 10, // update position
        }));
      })
      .on('mouseout', (event) => {
        onGenreHover(null);
        setTooltip({ visible: false, x: 0, y: 0, content: '' });
        d3.select(event.target).attr('stroke', null); // Remove the highlight when mouse leaves the cell
      });
  
    // X and Y Axis
    g.append('g')
      .call(d3.axisBottom(xScale).tickValues(years.filter((_, i) => i % 5 === 0)))
      .attr('transform', `translate(0,${height})`)
      .selectAll('text')
      .attr('text-anchor', 'end')
      .attr('transform', 'rotate(-45)')
      .style('font-size', '12px');
  
    g.append('g')
      .call(d3.axisLeft(yScale))
      .selectAll('text')
      .style('font-size', '12px');
  
    // Add "Years Released" label
    svg.append('text')
      .attr('class', 'x-axis-label')
      .attr('x', margin.left + width / 2)
      .attr('y', margin.top + height + 50) // Adjusted for slight positioning
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .text('Years Released');
  
    // Add "Genres" label
    svg.append('text')
    .attr('class', 'y-axis-label')
    .attr('x', margin.left - 400)  // Move left of the chart
    .attr('y', margin.top - 50)
    .attr('text-anchor', 'middle')
    .style('font-size', '14px')
    .style('transform', 'rotate(-90deg)')
    .text('Genres');

  
    // Legend for Color Scale (0 to 10)
    const legendHeight = 20;
    const legendWidth = 200;
  
    const legend = svg.append('g').attr('transform', `translate(${width / 2 - legendWidth / 2},${margin.top + height + 60})`);
  
    const legendScale = d3.scaleLinear().domain([0, 10]).range([0, legendWidth]);
    const legendAxis = d3.axisBottom(legendScale).ticks(5);
  
    const gradient = svg
      .append('defs')
      .append('linearGradient')
      .attr('id', 'legend-gradient')
      .attr('x1', '0%')
      .attr('x2', '100%')
      .attr('y1', '0%')
      .attr('y2', '0%');
  
    // Define color stops for the gradient (from light red to dark red)
    gradient.append('stop').attr('offset', '0%').attr('stop-color', d3.interpolateReds(0));  // Light red
    gradient.append('stop').attr('offset', '100%').attr('stop-color', d3.interpolateReds(1));  // Dark red
  
    legend
      .append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill', 'url(#legend-gradient)');
  
    legend.append('g').call(legendAxis).attr('transform', `translate(0,${legendHeight})`);
  };
  

  return (
    <div style={{ position: 'relative', padding: '20px', borderRadius: '15px', background: '#fafafa' }}>
      <h2 style={{ textAlign: 'center', fontSize: '24px', color: '#333' }}>Heat Map: Average Genre Ratings by Year</h2>
      <svg ref={svgRef} width="100%" height="600" />
      {tooltip.visible && (
        <div
          style={{
            position: 'absolute',
            left: tooltip.x,
            top: tooltip.y,
            backgroundColor: '#fff',
            padding: '10px 15px',
            borderRadius: '5px',
            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
            pointerEvents: 'none',
            fontSize: '14px',
            zIndex: 1000,  // Ensure it's on top of other elements
          }}
        >
          <div><strong>{tooltip.content}</strong></div>
        </div>
      )}
    </div>
  );
};

export default Heatmap;
