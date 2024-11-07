import { useState, useEffect, useCallback, useMemo } from 'react';
import KJUR from 'jsrsasign';
import credentials from '../../config/credentials.json'

const SPREADSHEET_ID = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;

const GoogleSheetsTest = () => {
    const [cellData, setCellData] = useState('Loading...');

    const memoizedCredentials = useMemo(() => credentials, []);

    const createJWT = useCallback(() => {
        const header = {
            alg: 'RS256',
            typ: 'JWT',
            kid: memoizedCredentials.private_key_id
        };

        const now = Math.floor(Date.now() / 1000);
        const claim = {
            iss: memoizedCredentials.client_email,
            scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
            aud: 'https://oauth2.googleapis.com/token',
            exp: now + 3600,
            iat: now,
        };

        const key = KJUR.KEYUTIL.getKey(memoizedCredentials.private_key);
        return KJUR.jws.JWS.sign('RS256', JSON.stringify(header), JSON.stringify(claim), key);
    }, [memoizedCredentials]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const jwt = createJWT();
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams({
                        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                        assertion: jwt,
                    }),
                });

                const { access_token } = await tokenResponse.json();

                const sheetResponse = await fetch(
                    `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/estados!A2`,
                    {
                        headers: {
                            'Authorization': `Bearer ${access_token}`,
                        },
                    }
                );

                const data = await sheetResponse.json();
                setCellData(data.values ? data.values[0][0] : 'No data found');

            } catch (err) {
                setCellData('Error loading data');
                console.error('Error:', err);
            }
        };

        fetchData();
    }, [createJWT]);

    return <div>{cellData}</div>;
};

export default GoogleSheetsTest;