import React, { useState, useEffect, useMemo } from 'react'; 
import { Scatter } from 'react-chartjs-2';
import { getChartConfig, getScatterPlotData } from './Chart'; 

import { Chart as ChartJS, Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement } from 'chart.js';

// Register necessary chart elements
ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement);

const ScatterPlot = ({ animeData, genreFilter, episodeLimitFilter, statusFilter, setSelectedAnime }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [tooltipContent, setTooltipContent] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 }); // Track tooltip position
  const [isTooltipVisible, setIsTooltipVisible] = useState(false); // To control tooltip visibility
  const [isMouseOverTooltip, setIsMouseOverTooltip] = useState(false); // To track mouse over tooltip state

  // Function to filter and process the anime data based on selected filters
  useEffect(() => {
    const filterData = () => {
      let filtered = animeData;

      // Filter by genre(s) - Support for multiple genres
      if (Array.isArray(genreFilter) && genreFilter.length > 0) {
        filtered = filtered.filter((anime) => genreFilter.every((genre) => anime.Genres.includes(genre)));
      } else {
        filtered = filtered.filter((anime) => anime.Genres.includes(genreFilter)); // Single genre filter
      }

      // Filter by completion status (completed or ongoing)
      if (statusFilter && statusFilter !== 'all') {
        filtered = filtered.filter((anime) => anime.Status === statusFilter);
      }

      // Filter by episode count ranges (only if episodeLimitFilter is provided)
      if (episodeLimitFilter && episodeLimitFilter.length > 0) {
        filtered = filtered.filter((anime) => {
          // Check if the anime's episode count matches any of the selected ranges
          return episodeLimitFilter.some((range) => {
            const [min, max] = range.split('-').map(Number);
            return anime.Episodes >= min && (max ? anime.Episodes <= max : true);
          });
        });
      }

      return filtered;
    };

    // Apply filters and set the filtered data
    setFilteredData(filterData());
  }, [animeData, genreFilter, statusFilter, episodeLimitFilter]);

  // Prepare data for the scatter plot
  const scatterPlotData = useMemo(() => {
    return getScatterPlotData(filteredData, genreFilter);
  }, [filteredData, genreFilter]);

  // Handle click on a point to select the anime
  const handlePointClick = (event, chartElement) => {
    if (chartElement.length > 0) {
      const index = chartElement[0].index;
      const selectedAnime = filteredData[index];

      // Pass selected anime to parent component (App.js)
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
        genres: anime.Genres || [], // Safely get genres, ensure it's an array
      });

      // Get the mouse position from the event to adjust tooltip position
      const chartArea = event.chart.chartArea;
      const mouseX = event.x - chartArea.left;
      const mouseY = event.y - chartArea.top;
      setTooltipPosition({ x: mouseX, y: mouseY });

      setIsTooltipVisible(true); // Show tooltip when hovering over a point
    } else {
      if (!isMouseOverTooltip) {
        setIsTooltipVisible(false); // Hide tooltip when mouse is not hovering over a point
      }
    }
  };

  // Handle mouse enter for the tooltip
  const handleTooltipMouseEnter = () => {
    setIsMouseOverTooltip(true); // Mouse entered the tooltip, don't hide it
  };

  // Handle mouse leave for the tooltip
  const handleTooltipMouseLeave = () => {
    setIsMouseOverTooltip(false); // Mouse left the tooltip, allow it to be hidden
    setIsTooltipVisible(false); // Hide tooltip if not hovering over the chart or tooltip
  };

  return (
    <div style={{ position: 'relative' }}>
      <h2>Scatter Plot: Anime Ratings by Genre</h2>
      
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
          }}
          onMouseEnter={handleTooltipMouseEnter} // Show tooltip when mouse enters
          onMouseLeave={handleTooltipMouseLeave} // Hide tooltip when mouse leaves
        >
          <h3>{tooltipContent.title}</h3>
          <p><strong>Year Released:</strong> {tooltipContent.releaseYear}</p>
          <p><strong>Rating:</strong> {tooltipContent.rating}</p>
          <p><strong>Status:</strong> {tooltipContent.status}</p>
          <p><strong>Episodes:</strong> {tooltipContent.episodes}</p>
          <p><strong>Genres:</strong> {tooltipContent.genres.length > 0 ? tooltipContent.genres.join(', ') : 'No genres available'}</p>
        </div>
      )}

      <Scatter
        data={scatterPlotData}
        options={{
          ...getChartConfig(filteredData, genreFilter, handlePointHover),
          onClick: handlePointClick, // Add the click handler
        }}
      />
    </div>
  );
};

export default ScatterPlot;
