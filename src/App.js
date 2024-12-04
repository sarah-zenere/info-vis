import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // To parse CSV data
import ScatterPlot from './components/scatterPlot'; // Import the ScatterPlot component

const App = () => {
  const [animeData, setAnimeData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // Filter by completed or ongoing
  const [episodeFilter, setEpisodeFilter] = useState(0); // Filter by maximum episode count
  const [genreFilter, setGenreFilter] = useState('Action'); // Default to 'Action' genre
  const [genres, setGenres] = useState([]); // To store the unique genres
  const [statuses, setStatuses] = useState([]); // To store the unique status values

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

            // Extract unique genres from the data
            const uniqueGenres = [
              ...new Set(parsedData.flatMap((anime) => anime.Genres))
            ];
            setGenres(uniqueGenres); // Set unique genres to state

            // Extract unique statuses from the data, excluding the 'status' field
            const uniqueStatuses = [
              ...new Set(parsedData.map((anime) => anime.Status))
            ];

            // Set statuses to include the unique ones from the data and add "All Statuses"
            setStatuses(['all', ...uniqueStatuses]); // 'all' option for showing all statuses
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
          {/* Dynamically create genre filter options */}
          {genres.map((genre) => (
            <option key={genre} value={genre}>
              {genre}
            </option>
          ))}
        </select>

        {/* Status filter - Hardcoded options */}
        <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter}>
          <option value="all">All Statuses</option>
          <option value="Finished Airing">Finished Airing</option>
          <option value="Currently Airing">Currently Airing</option>
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
