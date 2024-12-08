import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const Heatmap = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (data.length === 0) return;

    const genresByYear = processData(data);

    // Create the heatmap
    drawHeatmap(genresByYear);
  }, [data]);

  // Process the data to calculate the average rating for each genre per year
  const processData = (data) => {
    const genresByYear = {};

    data.forEach((anime) => {
      const year = new Date(anime.Aired).getFullYear();
      const genres = anime.Genres || []; // Handle empty genres field

      // Skip entries with no genres
      if (genres.length === 0) return;

      const rating = anime.Rating;

      genres.forEach((genre) => {
        if (!genresByYear[year]) genresByYear[year] = {};
        if (!genresByYear[year][genre]) genresByYear[year][genre] = [];
        genresByYear[year][genre].push(rating);
      });
    });

    // Calculate the average rating for each genre per year
    for (const year in genresByYear) {
      for (const genre in genresByYear[year]) {
        const ratings = genresByYear[year][genre];
        const avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
        genresByYear[year][genre] = avgRating;
      }
    }

    return genresByYear;
  };

  // Draw the heatmap with D3.js
  const drawHeatmap = (genresByYear) => {
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear the SVG before drawing

    const margin = { top: 40, right: 20, bottom: 60, left: 100 };
    const width = 800 - margin.left - margin.right;
    const height = 600 - margin.top - margin.bottom;

    // Extract all genres and years
    const genres = Array.from(
      new Set(Object.values(genresByYear).flatMap((yearData) => Object.keys(yearData)))
    );
    const years = Object.keys(genresByYear).map((year) => parseInt(year));

    // Set scales
    const xScale = d3.scaleBand()
      .domain(years)
      .range([0, width])
      .padding(0.05);

    const yScale = d3.scaleBand()
      .domain(genres)
      .range([0, height])
      .padding(0.05);

    const colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
      .domain([0, 10]); // Assuming ratings range from 0 to 10

    // Append an SVG group for margin
    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Draw the rectangles (cells) for each genre and year
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
      .attr('fill', (d) => colorScale(d.rating));

    // Add the x-axis (years)
    g.append('g')
      .selectAll('.x-axis')
      .data(years)
      .enter()
      .append('text')
      .attr('class', 'x-axis')
      .attr('x', (d) => xScale(d) + xScale.bandwidth() / 2)
      .attr('y', height)
      .attr('dy', '1em')
      .attr('text-anchor', 'middle')
      .text((d) => d);

    // Add the y-axis (genres)
    g.append('g')
      .selectAll('.y-axis')
      .data(genres)
      .enter()
      .append('text')
      .attr('class', 'y-axis')
      .attr('x', 0)
      .attr('y', (d) => yScale(d) + yScale.bandwidth() / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', 'middle')
      .text((d) => d);
  };

  return (
    <div>
      <h2>Genre Rating Heatmap</h2>
      <svg ref={svgRef} width="800" height="600" />
    </div>
  );
};

export default Heatmap;
