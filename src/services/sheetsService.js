import KJUR from 'jsrsasign';
import credentials from '../config/credentials.json';

const SPREADSHEET_ID = process.env.REACT_APP_GOOGLE_SPREADSHEET_ID;

const RANGES = {
  estados: 'estados!A1:C32',
  insttracking: 'insttracking!A2:G221',
  criterios: 'criterios!A2:F2641',
  acciones: 'acciones!A2:F661'
};

class SheetsService {
  constructor() {
    this.credentials = credentials;
  }

  createJWT() {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
      kid: this.credentials.private_key_id
    };

    const now = Math.floor(Date.now() / 1000);
    const claim = {
      iss: this.credentials.client_email,
      scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600,
      iat: now,
    };

    const key = KJUR.KEYUTIL.getKey(this.credentials.private_key);
    return KJUR.jws.JWS.sign('RS256', JSON.stringify(header), JSON.stringify(claim), key);
  }

  async getAccessToken() {
    const jwt = this.createJWT();
    
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

    if (!tokenResponse.ok) {
      throw new Error(`Failed to get access token: ${tokenResponse.statusText}`);
    }

    const { access_token } = await tokenResponse.json();
    return access_token;
  }

  async fetchRange(range, accessToken) {
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${range}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );
    
    if (!response.ok) {
        if (response.status === 429) {
      throw new Error('429: Rate limit exceeded. Please wait before trying again.');
    }
      throw new Error(`Failed to fetch range ${range}: ${response.statusText}`);
    }

    return response.json();
  }

  async fetchAllData(estado) {
    try {
      console.log('Fetching data for state:', estado);
      const accessToken = await this.getAccessToken();
      
      // parallel fetch all ranges
      const [estadosData, instTrackingData, criteriosData, accionesData] = await Promise.all([
        this.fetchRange(RANGES.estados, accessToken),
        this.fetchRange(RANGES.insttracking, accessToken),
        this.fetchRange(RANGES.criterios, accessToken),
        this.fetchRange(RANGES.acciones, accessToken)
      ]);

      // process estados data
      const estadosRows = estadosData.values || [];
      const stateRow = estadosRows.find(row => row[0] === estado);
      const stateData = stateRow ? {
        reporteListo: stateRow[1] === '1',
        acuseEmitido: stateRow[2] === '1'
      } : { reporteListo: false, acuseEmitido: false };

      // process institution tracking data
      const instTrackingRows = (instTrackingData.values || [])
        .filter(row => row[0] === estado)
        .reduce((acc, row) => {
          if (row[1]) { // check if institution name exists
            acc[row[1]] = {
              reported: row[2] === 'TRUE',
              radioValue: row[3] || '0',
              normModified: row[4] === 'TRUE',
              lastSaved: row[5] === 'TRUE',
              editable: row[6] === 'TRUE'
            };
          }
          return acc;
        }, {});

      // process criterios data
      const criteriosRows = (criteriosData.values || [])
        .filter(row => row[0] === estado)
        .reduce((acc, row) => {
          if (row[1]) { // check if institution name exists
            if (!acc[row[1]]) acc[row[1]] = [];
            acc[row[1]].push({
              accion: row[2],
              criterio: row[3],
              modificado: row[4] === '1'
            });
          }
          return acc;
        }, {});

      // process acciones data
      const accionesRows = (accionesData.values || [])
        .filter(row => row[0] === estado)
        .reduce((acc, row) => {
          if (row[1]) { // check if institution name exists
            if (!acc[row[1]]) acc[row[1]] = {};
            if (!acc[row[1]][row[2]]) acc[row[1]][row[2]] = [];
            acc[row[1]][row[2]].push({
              nombre: row[4] || '',
              enlace: row[3] || ''
            });
          }
          return acc;
        }, {});

      console.log('Processed data:', {
        stateData,
        instTrackingRows,
        criteriosRows,
        accionesRows
      });

      return {
        stateData,
        instTrackingData: instTrackingRows,
        criteriosData: criteriosRows,
        accionesData: accionesRows
      };

    } catch (error) {
      console.error('Error fetching sheet data:', error);
      throw error;
    }
  }

  async getAllStates() {
    try {
      const accessToken = await this.getAccessToken();
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values/${RANGES.estados}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );
      
      if (!response.ok) {
        throw new Error(`Failed to fetch states: ${response.statusText}`);
      }
  
      const data = await response.json();
      const states = {};
  
      // skip header
      (data.values || []).slice(1).forEach(row => {
        if (row[0]) { // if state name exists
          states[row[0]] = {
            institutions: [], //
            reporteListo: row[1] === '1',
            acuseEmitido: row[2] === '1'
          };
        }
      });
  
      return states;
    } catch (error) {
      console.error('Error fetching states:', error);
      throw error;
    }
  }
}

const sheetsService = new SheetsService();

export default sheetsService;