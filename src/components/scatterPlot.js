import React, { useState, useEffect, useMemo } from 'react'; 
import { Scatter } from 'react-chartjs-2';
import { getChartConfig, getScatterPlotData } from './Chart'; 
import { Chart as ChartJS, Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement } from 'chart.js';

// Register necessary chart elements
ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement);

const ScatterPlot = ({ animeData, genreFilter, episodeLimitFilter, statusFilter, setSelectedAnime }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [isMouseOverTooltip, setIsMouseOverTooltip] = useState(false);
  const [selectedAnimeDetails, setSelectedAnimeDetails] = useState({ name: '', synopsis: '' });

  const [selectedYear, setSelectedYear] = useState(null); // null means no year filter (show all)

  // Dynamically calculate the minimum year in the dataset
  const minYear = useMemo(() => {
    const years = animeData.map((anime) => parseInt(anime.Aired.split(' ')[2]));
    return Math.min(...years);
  }, [animeData]);

  // Function to filter and process the anime data based on selected filters
  useEffect(() => {
    const filterData = () => {
      let filtered = animeData;

      // Filter by genre(s)
      if (Array.isArray(genreFilter) && genreFilter.length > 0) {
        filtered = filtered.filter((anime) => genreFilter.every((genre) => anime.Genres.includes(genre)));
      } else {
        filtered = filtered.filter((anime) => anime.Genres.includes(genreFilter)); // Single genre filter
      }

      // Filter by completion status
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((anime) => anime.Status === statusFilter);
      }

      // Filter by episode count ranges
      if (episodeLimitFilter && episodeLimitFilter.length > 0) {
        filtered = filtered.filter((anime) => {
          return episodeLimitFilter.some((range) => {
            const [min, max] = range.split('-').map(Number);
            return anime.Episodes >= min && (max ? anime.Episodes <= max : true);
          });
        });
      }

      // Filter by selected year (if any)
      if (selectedYear && selectedYear !== 2023) { // If selectedYear is 2023 or below, filter
        filtered = filtered.filter((anime) => {
          const releaseYear = parseInt(anime.Aired.split(' ')[2]);
          return releaseYear === selectedYear;
        });
      }

      return filtered;
    };

    // Apply filters and set the filtered data
    setFilteredData(filterData());
  }, [animeData, genreFilter, statusFilter, episodeLimitFilter, selectedYear]);

  // Prepare data for the scatter plot
  const scatterPlotData = useMemo(() => {
    return getScatterPlotData(filteredData, genreFilter);
  }, [filteredData, genreFilter]);

  // Handle click on a point to select the anime
  const handlePointClick = (event, chartElement) => {
    if (chartElement.length > 0) {
      const index = chartElement[0].index;
      const selectedAnime = filteredData[index];
      setSelectedAnime(selectedAnime);
    }
  };

  // Prepare custom tooltip content when hovering over a point
  const handlePointHover = (event, chartElement) => {
    if (chartElement.length > 0) {
      const index = chartElement[0].index;
      const anime = filteredData[index];
      setTooltipContent({
        title: anime.Name,
        releaseYear: anime.Aired.split(' ')[2],
        rating: anime.Rating,
        status: anime.Status,
        episodes: anime.Episodes,
        genres: anime.Genres || [],
        synopsis: anime.Synopsis || "No synopsis available",
      });

      const chartArea = event.chart.chartArea;
      const mouseX = event.x - chartArea.left;
      const mouseY = event.y - chartArea.top;
      setTooltipPosition({ x: mouseX, y: mouseY });
      setIsTooltipVisible(true);
    } else {
      if (!isMouseOverTooltip) {
        setIsTooltipVisible(false);
      }
    }
  };

  // Handle mouse enter/leave for the tooltip
  const handleTooltipMouseEnter = () => {
    setIsMouseOverTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    setIsMouseOverTooltip(false);
    setIsTooltipVisible(false);
  };

  // Function to show the synopsis in the second box
  const handleShowSynopsisClick = () => {
    if (tooltipContent && tooltipContent.synopsis) {
      setSelectedAnimeDetails({
        name: tooltipContent.title,
        synopsis: tooltipContent.synopsis,
      });
    }
  };

  // Function to close the synopsis box
  const handleCloseSynopsis = () => {
    setSelectedAnimeDetails({
      name: '',
      synopsis: '',
    });
  };

  return (
    <div style={{ position: 'relative', background: 'linear-gradient(to bottom right, #f0f8ff, #e6e6fa)', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ textAlign: 'center', fontFamily: 'Arial, sans-serif', color: '#333' }}>Scatter Plot: Anime Ratings by Genre</h2>

      {/* Display Tooltip Information */}
      {tooltipContent && isTooltipVisible && (
        <div
          className="tooltip"
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x + 10}px`,
            top: `${tooltipPosition.y + 10}px`,
            padding: '10px',
            backgroundColor: 'white',
            border: '1px solid #ccc',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            zIndex: 10,
            borderRadius: '8px',
            fontFamily: 'Arial, sans-serif',
          }}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <h3>{tooltipContent.title}</h3>
          <p><strong>Year Released:</strong> {tooltipContent.releaseYear}</p>
          <p><strong>Rating:</strong> {tooltipContent.rating}</p>
          <p><strong>Status:</strong> {tooltipContent.status}</p>
          <p><strong>Episodes:</strong> {tooltipContent.episodes}</p>
          <p><strong>Genres:</strong> {tooltipContent.genres.length > 0 ? tooltipContent.genres.join(', ') : 'No genres available'}</p>
          <button 
            onClick={handleShowSynopsisClick} 
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
            }}
          >
            Show Synopsis
          </button>
        </div>
      )}

      {/* Render the Synopsis Box below the Scatter Plot */}
      {selectedAnimeDetails.synopsis && (
        <div
          style={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#f4f4f9',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <h3>{selectedAnimeDetails.name}</h3> {/* Display Anime Name */}
          <p>{selectedAnimeDetails.synopsis}</p> {/* Display Synopsis */}
          <button 
            onClick={handleCloseSynopsis} 
            style={{
              marginTop: '10px',
              padding: '5px 10px',
              backgroundColor: '#f44336', // Red for close button
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '5px',
            }}
          >
            Close
          </button>
        </div>
      )}

      {/* Scatter plot */}
      <Scatter
        data={scatterPlotData}
        options={{
          ...getChartConfig(filteredData, genreFilter, handlePointHover),
          onClick: handlePointClick, // Add the click handler
        }}
      />

      {/* Slider for selecting year */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <label htmlFor="yearSlider" style={{ fontSize: '16px', color: '#333' }}>
          Filter by Year:
        </label>
        <input 
          id="yearSlider"
          type="range"
          min={1963}  // Set min value dynamically
          max={2023}  // Max value is set to 2023
          step={1}
          value={selectedYear || 2023} // Default to 2023
          onChange={(e) => setSelectedYear(parseInt(e.target.value) === 2023 ? null : parseInt(e.target.value))} // Reset to all data if max is selected
          style={{
            width: '100%',
            maxWidth: '600px',
            margin: '10px 0',
            cursor: 'pointer',
            appearance: 'none',
            height: '12px',
            background: '#ddd',
            borderRadius: '8px',
            outline: 'none',
          }}
        />
        <p>{selectedYear ? `Selected Year: ${selectedYear}` : 'Showing all years'}</p>
      </div>
    </div>
  );
};

export default ScatterPlot;
