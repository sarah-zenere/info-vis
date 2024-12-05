// Chart.js (or chartConfig.js) file
import { Tooltip } from 'chart.js';

const getChartConfig = (filteredData, genreFilter, handlePointHover) => {
  return {
    responsive: true,
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
        title: {
          display: true,
          text: 'Year Released',
        },
        min: 1960,  // Set the minimum year to 1960
        max: 2024,  // Set the maximum year to 2024
        ticks: {
          stepSize: 1,  // Set step size to 1 year
          callback: function(value) {
            return value; // Display year as 2010 instead of 2,010
          },
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
    onElementsClick: handlePointHover,
    onHover: handlePointHover,
  };
};

const getScatterPlotData = (filteredData, genreFilter) => {
  const data = filteredData.map((anime) => ({
    x: parseInt(anime.Aired.split(' ')[2]), // Extract the release year from the 'Aired' field
    y: anime.Rating,                        // Use the Rating for Y-axis
    title: anime.Name,                      // Title of the anime
    status: anime.Status,                   // Status (Completed/Ongoing)
    episodes: anime.Episodes,               // Episode count
  }));

  return {
    datasets: [
      {
        label: `Anime Ratings (${genreFilter.join(", ")})`, // Shows all selected genres
        data,
        backgroundColor: 'rgba(255, 99, 132, 0.6)', // Scatter plot point color
        borderColor: 'rgba(255, 99, 132, 1)',      // Scatter plot border color
        borderWidth: 1,
      },
    ],
  };
};

export { getChartConfig, getScatterPlotData };
