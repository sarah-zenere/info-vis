import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register necessary chart elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ csvData }) => {
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    if (!csvData) return;

    // Parse the CSV data using Papa.parse
    Papa.parse(csvData, {
      header: true,        // Treat the first row as the header
      dynamicTyping: true, // Convert numbers and booleans automatically
      complete: function(results) {
        console.log('Parsed Data:', results); // Log parsed data to check structure
        
        // Check if the results contain the necessary data
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

        // Prepare the chart data
        const data = {
          labels: validData.map(row => row.Name),
          datasets: [
            {
              label: 'Scores',
              data: validData.map(row => parseFloat(row.Score)),
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1,
            },
          ],
        };

        // Set the chart data
        setChartData(data);
      },
      error: function(error) {
        console.error('Error parsing CSV:', error); // Log any parsing errors
      }
    });
  }, [csvData]);

  return (
    <div>
      <h2>Anime Scores Bar Chart</h2>
      {/* Render chart only if chartData is properly set */}
      {chartData.labels ? (
        <Bar
          data={chartData}
          options={{
            scales: {
              y: {
                type: 'linear',  // Ensure linear scale is used for y-axis
                beginAtZero: true,
              },
            },
          }}
        />
      ) : (
        <p>Loading chart...</p>
      )}
    </div>
  );
};

export default BarChart;
