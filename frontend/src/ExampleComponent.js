import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ExampleComponent() {
    const [data, setData] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:8080/message');
                console.log('Response:', response); // Log the entire response
                setData(response.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            <h1>Data from Backend:</h1>
            <p>{data}</p> {/* This should show "Data fetched Successfully" */}
        </div>
    );
}

export default ExampleComponent;
