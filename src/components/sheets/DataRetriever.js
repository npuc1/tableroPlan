import { useState, useEffect, useCallback, useMemo } from 'react';
import KJUR from 'jsrsasign';
import credentials from '../../config/credentials.json'

const SHEET_RANGE = `estados!A1:C32`; // rango de info de estados

const DataRetriever = ({ estadoSeleccionado }) => {
  const [acuseData, setAcuseData] = useState('Cargando...');
  const [error, setError] = useState(null);

  const memoizedCredentials = useMemo(() => credentials, []);

  const SPREADSHEET_ID = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;

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
        
        // Get access token
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
        
        // Get sheet data
        const sheetResponse = await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}`,
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          }
        );

        const data = await sheetResponse.json();
        
        // Find the row for user's state and get acuse value
        const rows = data.values;
        const stateRow = rows.find(row => row[0] === estadoSeleccionado);
        const acuseValue = stateRow ? stateRow[2] : 'State not found'; // Column C (index 2) contains acuse
        
        setAcuseData(acuseValue);

      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      }
    };

    fetchData();
  }, [createJWT, SPREADSHEET_ID, estadoSeleccionado]);

  if (error) {
    return <div>Error loading data: {error}</div>;
  }

  return (
    <div>
      Generó acuse: {acuseData}
    </div>
  );
};

export default DataRetriever;