import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // To parse CSV data
import ScatterPlot from './components/scatterPlot'; // Import the ScatterPlot component

const App = () => {
  const [animeData, setAnimeData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // Filter by completed or ongoing
  const [episodeFilter, setEpisodeFilter] = useState(0); // Filter by maximum episode count
  const [genreFilter, setGenreFilter] = useState('Action'); // Default to 'Action' genre

  // Fetch and parse the CSV data on component mount
  useEffect(() => {
    fetch('/data/filtered_anime_data.csv') // Replace with the correct path to your data
      .then((response) => response.text())
      .then((csv) => {
        Papa.parse(csv, {
          complete: (result) => {
            const parsedData = result.data.map((row) => ({
              Name: row[0],
              Rating: parseFloat(row[1]) || 0,
              Genres: row[2] ? row[2].split(',').map((genre) => genre.trim()) : [],
              Status: row[6] || 'Unknown',
              Episodes: parseInt(row[4], 10) || 0,
              Aired: row[5],
            }));
            setAnimeData(parsedData);
          },
          error: (error) => console.error('Error parsing CSV:', error),
        });
      })
      .catch((error) => console.error('Error loading CSV file:', error));
  }, []);

  return (
    <div className="App">
      <h1>Anime Ratings Visualization</h1>

      {/* Filters */}
      <div>
        {/* Genre filter */}
        <select onChange={(e) => setGenreFilter(e.target.value)} value={genreFilter}>
          <option value="Action">Action</option>
          <option value="Adventure">Adventure</option>
          <option value="Comedy">Comedy</option>
          <option value="Drama">Drama</option>
          <option value="Romance">Romance</option>
          {/* Add other genres as needed */}
        </select>

        {/* Status filter */}
        <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="ongoing">Ongoing</option>
        </select>

        {/* Episode count filter */}
        <input
          type="number"
          placeholder="Max Episodes"
          onChange={(e) => setEpisodeFilter(parseInt(e.target.value, 10))}
          value={episodeFilter}
          min="0"
        />
      </div>

      {/* Scatter Plot component */}
      {animeData.length > 0 && (
        <ScatterPlot
          animeData={animeData}
          genreFilter={genreFilter}
          episodeLimitFilter={episodeFilter}
          statusFilter={statusFilter === 'all' ? null : statusFilter} // Pass null if "all"
        />
      )}
    </div>
  );
};

export default App;
