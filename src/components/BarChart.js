import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import Papa from 'papaparse';

const BarChart = () => {
    const [chartData, setChartData] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            const response = await fetch(process.env.PUBLIC_URL + '/data/filtered_anime_data.csv');
            const reader = response.body.getReader();
            const result = await reader.read();
            const decoder = new TextDecoder('utf-8');
            const csv = decoder.decode(result.value);
            
            Papa.parse(csv, {
                header: true,
                dynamicTyping: true,
                complete: function(results) {
                    const data = {
                        labels: results.data.map(row => row.animeName),
                        datasets: [
                            {
                                label: 'Rating',
                                data: results.data.map(row => row.rating),
                                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                                borderColor: 'rgba(75, 192, 192, 1)',
                                borderWidth: 1,
                            },
                        ],
                    };
                    setChartData(data);
                },
            });
        };

        fetchData();
    }, []);

    return (
        <div>
            <h2>Anime Ratings Bar Chart</h2>
            <Bar data={chartData} />
        </div>
    );
};

export default BarChart;