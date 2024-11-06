import React, { useState, useEffect } from 'react';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
const SPREADSHEET_ID = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;
const RANGE = 'Sheet1!A1';

const GoogleSheetDemo = () => {
    const [cellData, setCellData] = useState('Loading...');
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadGoogleSheets = async () => {
            try {
                // Load the API client library
                const { google } = require('googleapis');
                const { authenticate } = require('@google-cloud/local-auth');

                // Authenticate with Google
                const auth = await authenticate({
                    keyfilePath: './credentials.json', // Path to your credentials file
                    scopes: SCOPES,
                });

                // Create Google Sheets instance
                const sheets = google.sheets({ version: 'v4', auth });

                // Make the API call
                const response = await sheets.spreadsheets.values.get({
                    spreadsheetId: SPREADSHEET_ID,
                    range: RANGE,
                });

                // Get the value from the response
                const value = response.data.values ? response.data.values[0][0] : 'No data found';
                setCellData(value);
            } catch (err) {
                setError(err.message);
                console.error('Error loading data:', err);
            }
        };

        loadGoogleSheets();
    }, []);

    if (error) {
        return <div className="text-red-500">Error: {error}</div>;
    }

    return (
        <div className="p-4 border rounded">
            <h2 className="text-xl mb-2">Google Sheets Data</h2>
            <div className="bg-gray-100 p-2 rounded">
                Cell Value: {cellData}
            </div>
        </div>
    );
};

export default GoogleSheetDemo;