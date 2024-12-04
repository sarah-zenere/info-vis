import React, { useEffect, useState } from 'react';
import * as d3 from 'd3';
import Heatmap from './components/heatMap';

const App = () => {
  const [animeData, setAnimeData] = useState(null);

  // Fetch cleaned and processed data
  useEffect(() => {
    // Fetch data from your API or local JSON file
    fetch('path_to_cleaned_data.json')
      .then(response => response.json())
      .then(data => setAnimeData(data))
      .catch(error => console.error('Error fetching data:', error));
  }, []);

  // D3.js code for visualization
  useEffect(() => {
    if (animeData) {
      // D3.js code here for visualizations using the cleaned data
      // Example: Create a simple bar chart
      const svg = d3.select('#chart')
        .append('svg')
        .attr('width', 400)
        .attr('height', 200);

      svg.selectAll('rect')
        .data(animeData)
        .enter()
        .append('rect')
        .attr('x', (d, i) => i * 50)
        .attr('y', d => 200 - d.rating * 20)
        .attr('width', 40)
        .attr('height', d => d.rating * 20)
        .attr('fill', 'steelblue');
    }
  }, [animeData]);

 

  return (
    <div>
      <h1>Anime Recommendation</h1> 
      <div id="chart"></div>

      <div className="App">
      <h1>Average Rating for Genres Per Year</h1>
      <Heatmap />
      </div>

    </div>
   
  );
};

export default App;