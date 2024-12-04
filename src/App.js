import React, { useEffect, useState } from 'react';
import BarChart from './components/BarChart'; // Ensure the path is correct

const App = () => {
  const [csvData, setCsvData] = useState(null);

  useEffect(() => {
    // Fetch the CSV file from the public folder
    fetch('/data/filtered_anime_data.csv')
      .then(response => response.text())  // Get the CSV as text
      .then(csv => setCsvData(csv))  // Set the raw CSV data to state
      .catch(error => console.error('Error loading CSV file:', error));
  }, []);

  return (
    <div>
      <h1>Anime Recommendation</h1>
      {csvData ? <BarChart csvData={csvData} /> : <p>Loading data...</p>}
    </div>
  );
};

export default App;
