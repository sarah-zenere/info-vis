import React, { useState, useEffect, useMemo } from 'react';
import { Scatter } from 'react-chartjs-2';
import { Chart as ChartJS, Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement } from 'chart.js';

// Register necessary chart elements
ChartJS.register(Title, Tooltip, Legend, LinearScale, CategoryScale, PointElement);

const ScatterPlot = ({ animeData, genreFilter, episodeLimitFilter, statusFilter }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(genreFilter || 'Action'); // Default to 'Action' genre
  const [tooltipContent, setTooltipContent] = useState(null);

  // Function to filter and process the anime data based on selected filters
  const filterData = useMemo(() => {
    // Filter by genre
    let filtered = animeData.filter((anime) => anime.Genres.includes(selectedGenre));

    // Filter by completion status (completed or ongoing)
    if (statusFilter) {
      filtered = filtered.filter((anime) => anime.Status === statusFilter);
    }

    // Filter by episode count
    if (episodeLimitFilter) {
      filtered = filtered.filter((anime) => anime.Episodes <= episodeLimitFilter);
    }

    return filtered;
  }, [animeData, selectedGenre, statusFilter, episodeLimitFilter]);

  // Prepare data for the scatter plot
  const scatterPlotData = useMemo(() => {
    const data = filteredData.map((anime) => {
      // Check if 'Aired' field exists and is correctly formatted
      if (!anime.Aired) {
        console.log(`Missing Aired field for anime: ${anime.Name}`);
        return null; // Skip this anime if no Aired field
      }

      // Extract the start year from the 'Aired' field (format example: "Apr 3, 1998 to Apr 24, 1999")
      const airedStartDate = anime.Aired.split(' to ')[0]; // Get the part before " to "
      const airedYear = airedStartDate.split(' ')[2]; // Get the year from the date string
      
      // Make sure 'airedYear' is a valid number and parse the rating
      const year = parseInt(airedYear, 10);
      const rating = parseFloat(anime.Rating);

      if (isNaN(year) || isNaN(rating)) {
        console.log(`Invalid year or rating for anime: ${anime.Name}, Year: ${airedYear}, Rating: ${anime.Rating}`);
        return null; // Skip invalid data
      }

      return {
        x: year,  // Year on X-axis
        y: rating, // Rating on Y-axis
        title: anime.Name,  // Title of the anime
        status: anime.Status,  // Status (Completed/Ongoing)
        episodes: anime.Episodes, // Number of episodes
      };
    }).filter(Boolean);  // Remove any null values from invalid data

    // Log the data to see if it's correctly processed
    console.log('Filtered Scatter Plot Data:', data);

    return {
      datasets: [
        {
          label: `Anime Ratings in ${selectedGenre}`,
          data: data,  // Use the filtered data for plotting
          backgroundColor: 'rgba(255, 99, 132, 0.6)', // Scatter plot point color
          borderColor: 'rgba(255, 99, 132, 1)',      // Border color for points
          borderWidth: 1,
        },
      ],
    };
  }, [filteredData, selectedGenre]);

  useEffect(() => {
    setFilteredData(filterData);
  }, [filterData]);

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
      });
    } else {
      setTooltipContent(null);
    }
  };

  return (
    <div>
      <h2>Scatter Plot: Anime Ratings by Genre</h2>
      
      {/* Display Tooltip Information */}
      {tooltipContent && (
        <div className="tooltip">
          <h3>{tooltipContent.title}</h3>
          <p><strong>Year Released:</strong> {tooltipContent.releaseYear}</p>
          <p><strong>Rating:</strong> {tooltipContent.rating}</p>
          <p><strong>Status:</strong> {tooltipContent.status}</p>
          <p><strong>Episodes:</strong> {tooltipContent.episodes}</p>
        </div>
      )}

      <Scatter
        data={scatterPlotData}
        options={{
          responsive: true,
          scales: {
            x: {
              type: 'linear',
              position: 'bottom',
              title: {
                display: true,
                text: 'Year Released',
              },
            },
            y: {
              type: 'linear',
              min: 0,
              max: 10,
              title: {
                display: true,
                text: 'Rating (0 - 10)',
              },
            },
          },
          plugins: {
            tooltip: {
              enabled: false, // Disable the default tooltip
            },
          },
        }}
        onElementsClick={handlePointHover}
        onHover={handlePointHover}
      />
    </div>
  );
};

export default ScatterPlot;
