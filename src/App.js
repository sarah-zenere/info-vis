import React, { useState, useEffect } from 'react';
import Papa from 'papaparse'; // To parse CSV data
import ScatterPlot from './components/scatterPlot'; // Import the ScatterPlot component
import Heatmap from './components/heatMap';

const App = () => {
  const [animeData, setAnimeData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all'); // Status filter as a single value
  const [episodeFilter, setEpisodeFilter] = useState([]); // Filter by episode ranges (array of ranges)
  const [genreFilter, setGenreFilter] = useState(['Action']); // Always an array, default to 'Action' genre
  const [genres, setGenres] = useState([]); // To store the unique genres
  const [statuses, setStatuses] = useState([]); // To store the unique status values
  const [selectedAnime, setSelectedAnime] = useState(null); // State to hold selected anime for synopsis popup
  const [showSynopsis, setShowSynopsis] = useState(false); // Flag to show synopsis box
  const [hoveredGenre, setHoveredGenre] = useState(null); 

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
              Synopsis: row[3] || 'No synopsis available', // Assuming the synopsis is in the 8th column
            }));
            setAnimeData(parsedData);

            // Extract unique genres, filter out 'Genres'
            const uniqueGenres = [
              ...new Set(parsedData.flatMap((anime) => anime.Genres))
            ].filter((genre) => genre !== 'Genres'); // Filter out the "Genres" option

            setGenres(uniqueGenres); // Set unique genres to state

            // Extract unique statuses (including the 'all' option)
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

  // Function to handle genre filter changes (ensure genreFilter is always an array)
  const handleGenreFilterChange = (event) => {
    const { value, checked } = event.target;

    const newGenreFilter = checked
      ? [...genreFilter, value] // Add genre if checked
      : genreFilter.filter((genre) => genre !== value); // Remove genre if unchecked

    setGenreFilter(newGenreFilter);
  };

  // Function to handle episode filter changes
  const handleEpisodeFilterChange = (event) => {
    const { value, checked } = event.target;
    const newEpisodeFilter = checked
      ? [...episodeFilter, value] // Add range if checked
      : episodeFilter.filter((range) => range !== value); // Remove range if unchecked

    setEpisodeFilter(newEpisodeFilter);
  };

  // Function to handle status filter changes (dropdown)
  const handleStatusFilterChange = (event) => {
    setStatusFilter(event.target.value);
  };

  // Filter the anime data based on genre, episode, and status filters
  const filteredData = animeData.filter((anime) => {
    // Filter by genre
    const genreMatch = genreFilter.length === 0 || genreFilter.some((genre) => anime.Genres.includes(genre));

    // Filter by episode range
    const episodeMatch =
      episodeFilter.length === 0 ||
      episodeFilter.some((range) => {
        const [min, max] = range.split('-').map(Number);
        return anime.Episodes >= min && (max ? anime.Episodes <= max : true);
      });

    // Filter by status (only apply if "all" is not selected)
    const statusMatch = statusFilter === 'all' || anime.Status === statusFilter;

    // Return true if anime passes all filters
    return genreMatch && episodeMatch && statusMatch;
  });

  // Function to show the synopsis when "Show Synopsis" is clicked
  const handleShowSynopsis = () => {
    setShowSynopsis(true);
  };

  // Function to handle closing the synopsis box
  const handleCloseSynopsis = () => {
    setShowSynopsis(false);
  };

  // Function to handle hover over genre
  const handleGenreHover = (genre) => {
    setHoveredGenre(genre);
  };

  return (
    <div className="App">
      <h1>Anime Ratings Visualization</h1>

      {/* Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {/* Genre filter */}
        <div className="genre-filter" style={{ width: '30%', display: 'flex', flexDirection: 'column' }}>
          <h3>Genres</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
            {genres.map((genre) => (
              <label key={genre} style={{ display: 'block', width: '100%' }}>
                <input
                  type="checkbox"
                  value={genre}
                  checked={genreFilter.includes(genre)} // If genre is in the filter, it's checked
                  onChange={handleGenreFilterChange}
                  style={{ marginRight: '5px' }}
                />
                {genre}
              </label>
            ))}
          </div>
        </div>

        {/* Status filter (dropdown) */}
        <div className="status-filter" style={{ width: '30%' }}>
          <h3>Status</h3>
          <select onChange={handleStatusFilterChange} value={statusFilter} style={{ width: '100%', padding: '5px' }}>
            <option value="all">All Statuses</option>
            <option value="Finished Airing">Finished Airing</option>
            <option value="Currently Airing">Currently Airing</option>
          </select>
        </div>

        {/* Episode count filter (checkboxes) */}
        <div className="episode-filter" style={{ width: '30%' }}>
          <h3>Episode Count</h3>
          {['0-50', '51-100', '101-200', '201-300', '301-500', '501-1000', '1001+'].map((range) => (
            <label key={range} style={{ display: 'block', border: '1px solid #ccc', padding: '5px', marginBottom: '10px' }}>
              <input
                type="checkbox"
                value={range}
                checked={episodeFilter.includes(range)}
                onChange={handleEpisodeFilterChange}
                style={{ marginRight: '5px' }}
              />
              {range}
            </label>
          ))}
        </div>
      </div>

      {/* Heatmap component */}
      <Heatmap data={animeData} onGenreHover={handleGenreHover} />

      {/* Scatter Plot component */}
      {filteredData.length > 0 && (
        <ScatterPlot
          animeData={filteredData} // Pass the filtered data to the ScatterPlot
          genreFilter={genreFilter}
          episodeLimitFilter={episodeFilter}
          statusFilter={statusFilter === 'all' ? null : statusFilter} // Pass null if "all" selected
          setSelectedAnime={setSelectedAnime} // Pass the setSelectedAnime function to ScatterPlot to update selected anime
        />
      )}


      {/* Popup for Basic Anime Details */}
      {selectedAnime && !showSynopsis && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '20%',
            width: '60%',
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 20,
          }}
        >
          <h2>{selectedAnime.Name}</h2>
          <p><strong>Rating:</strong> {selectedAnime.Rating}</p>
          <p><strong>Episodes:</strong> {selectedAnime.Episodes}</p>
          <button
            onClick={handleShowSynopsis}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#007BFF',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Show Synopsis
          </button>
        </div>
      )}

      {/* Popup for Anime Synopsis */}
      {showSynopsis && (
        <div
          style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            width: '40%',
            backgroundColor: 'white',
            padding: '20px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 20,
          }}
        >
          <h2>Synopsis</h2>
          <p>{selectedAnime.Synopsis}</p>
          <button
            onClick={handleCloseSynopsis}
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#FF0000',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
