import { useState, useEffect, useCallback, useMemo } from 'react';
import KJUR from 'jsrsasign';
import credentials from '../../config/credentials.json'

const SHEET_RANGE = `estados!A1:C32`;

const GoogleSheetsInit = ({ appMetadata, setStates, setIsLoading, setDataInitialized, }) => {
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
        setIsLoading(true);
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
          `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${SHEET_RANGE}`,
          {
            headers: {
              'Authorization': `Bearer ${access_token}`,
            },
          }
        );

        const data = await sheetResponse.json();
        
        const rows = data.values;
        const stateRow = rows.find(row => row[0] === appMetadata.estado);
        
        if (stateRow) {
          setStates(prevStates => ({
            ...prevStates,
            [appMetadata.estado]: {
              ...prevStates[appMetadata.estado],
              reporteListo: stateRow[1] === '1', // convierte '0'/'1' a booleano
              acuseEmitido: stateRow[2] === '1'
            }
          }));
          setDataInitialized(true);
        }

      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [createJWT, SPREADSHEET_ID, appMetadata.estado, setIsLoading, setStates, setDataInitialized]);

  // Only render error if there is one
  return error ? <div>Error initializing data: {error}</div> : null;
};

export default GoogleSheetsInit;