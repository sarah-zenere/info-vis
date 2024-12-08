import React, { useEffect, useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ csvData }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!csvData) return;

    // Parse the CSV data using Papa.parse
    Papa.parse(csvData, {
      header: true,        // Treat the first row as the header
      dynamicTyping: true, // Convert numbers and booleans automatically
      complete: function(results) {
        console.log('Parsed Data:', results); // Log parsed data to check structure

        if (!results.data || results.data.length === 0) {
          console.error('No data found in CSV.');
          return;
        }

        // Filter rows that have valid 'Name' and 'Score'
        const validData = results.data.filter(row => row.Name && row.Score);

        if (validData.length === 0) {
          console.error('No valid rows found with Name and Score.');
          return;
        }

        // Group the data by the first genre (ignore subsequent genres)
        const groupedByFirstGenre = validData.reduce((acc, row) => {
          // Get the first genre (ignore subsequent genres)
          const firstGenre = row.Genres.split(',')[0].trim();

          // If the genre doesn't exist in the accumulator, create a new array
          if (!acc[firstGenre]) acc[firstGenre] = [];

          // Add the anime to the respective genre group
          acc[firstGenre].push(row);
          
          return acc;
        }, {});

        // Create chart data for each first genre and sort by score (only once)
        const chartDataArray = Object.keys(groupedByFirstGenre).map(genre => {
          const genreData = groupedByFirstGenre[genre];

          // Sort the genre data by score in ascending order only once
          const sortedData = genreData.sort((a, b) => a.Score - b.Score);

          return {
            genre,
            data: {
              labels: sortedData.map(row => row.Name),
              datasets: [
                {
                  label: `Scores - ${genre}`,
                  data: sortedData.map(row => parseFloat(row.Score)),
                  backgroundColor: 'rgba(54, 162, 235, 0.6)',
                  borderColor: 'rgba(54, 162, 235, 1)',
                  borderWidth: 1,
                },
              ],
            },
          };
        });

        // Set the chart data once after processing
        setChartData(chartDataArray);
      },
      error: function(error) {
        console.error('Error parsing CSV:', error); // Log any parsing errors
      }
    });
  }, [csvData]);

  // Memoize chart data to prevent re-calculation on each render
  const memoizedChartData = useMemo(() => chartData, [chartData]);

  return (
    <div>
      <h2>Anime Scores Bar Charts by First Genre (Sorted by Score)</h2>
      {memoizedChartData.length === 0 ? (
        <p>Loading chart...</p>
      ) : (
        memoizedChartData.map((chart, index) => (
          <div key={index}>
            <h3>{chart.genre}</h3>
            <Bar
              data={chart.data}
              options={{
                scales: {
                  y: {
                    type: 'linear',
                    beginAtZero: true,
                  },
                },
              }}
            />
          </div>
        ))
      )}
    </div>
  );
};

export default BarChart;
