import KJUR from 'jsrsasign';
import credentials from '../config/credentials.json';
import rateLimiter from './rateLimiterService'

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
      scope: 'https://www.googleapis.com/auth/spreadsheets',
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

  async checkRateLimitAndWait() {
    const waitTime = await rateLimiter.checkRateLimit();
    if (waitTime > 0) {
      throw new Error(`RATE_LIMIT:${waitTime}`);
    }
  }

  async fetchRange(range, accessToken) {
    await this.checkRateLimitAndWait();
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
      await this.checkRateLimitAndWait();
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
      await this.checkRateLimitAndWait();
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

  async saveInstitutionData(estado, institution, data) {
    try {
      await this.checkRateLimitAndWait();

      const accessToken = await this.getAccessToken();
      
      //current data para encontrar filas para actualizar
      const [trackingData, criteriosData, accionesData] = await Promise.all([
        this.fetchRange('insttracking!A2:G221', accessToken),
        this.fetchRange('criterios!A2:F2641', accessToken),
        this.fetchRange('acciones!A2:F661', accessToken)
      ]);

      // row indices por hoja
      const trackingRowIndex = trackingData.values.findIndex(row => 
        row[0] === estado && row[1] === institution
      ) + 2; // +2 because sheet is 1-based y skip header

      // prepare the batch update request
      const requests = [];

      // 1. Update tracking data
      requests.push({
        range: `insttracking!A${trackingRowIndex}:G${trackingRowIndex}`,
        values: [[
          estado,
          institution,
          data.reported.toString().toUpperCase(),
          data.radioValue,
          data.normModified.toString().toUpperCase(),
          data.lastSaved.toString().toUpperCase(),
          data.editable.toString().toUpperCase()
        ]]
      });

      // 2. criterios updates
      const criteriosUpdates = [];
      for (const accion of [1, 2, 3]) {
        const criteriosForAccion = Object.entries(data)
          .filter(([key, _]) => key.startsWith(`${accion}`) && key.length === 2)
          .map(([key, value]) => ({
            accion: key.charAt(0),
            criterio: key.charAt(1),
            modificado: value
          }));

        criteriosForAccion.forEach(criterio => {
          criteriosUpdates.push([
            estado,
            institution,
            criterio.accion,
            criterio.criterio,
            criterio.modificado ? '1' : '0',
            new Date().toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',    
              minute: '2-digit', 
              second: '2-digit'   
          })
          ]);
        });
      }

      // find and update criterios
      const criteriosStartRow = criteriosData.values.findIndex(row => 
        row[0] === estado && row[1] === institution
      ) + 2;

      if (criteriosStartRow > 1) {
        requests.push({
          range: `criterios!A${criteriosStartRow}:F${criteriosStartRow + criteriosUpdates.length - 1}`,
          values: criteriosUpdates
        });
      }

      // 3. acciones (enlaces a normatividad) updates
      const accionesUpdates = [];
      for (const accion of [1, 2, 3]) {
        accionesUpdates.push([
          estado,
          institution,
          accion.toString(),
          data[`normLink${accion}`] || '',
          data[`normName${accion}`] || '',
          new Date().toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',    
            minute: '2-digit', 
            second: '2-digit'   
        })
        ]);
      }

      // find and update filas acciones rows o agrega nuevas
      const accionesStartRow = accionesData.values.findIndex(row => 
        row[0] === estado && row[1] === institution
      ) + 2;

      if (accionesStartRow > 1) {
        requests.push({
          range: `acciones!A${accionesStartRow}:F${accionesStartRow + accionesUpdates.length - 1}`,
          values: accionesUpdates
        });
      }

      // execute batch update
      const batchUpdateResponse = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            valueInputOption: 'RAW',
            data: requests
          })
        }
      );

      if (!batchUpdateResponse.ok) {
        throw new Error('Failed to update data');
      }

      console.log('Saved data:', data);

      return await batchUpdateResponse.json();

    } catch (error) {
      if (error.message.startsWith('RATE_LIMIT:')) {
        const waitTime = parseInt(error.message.split(':')[1]);
        throw new Error(`Por favor espere ${waitTime} segundos antes de continuar.`);
      }
      throw error;
    }
  }

  async updateAcuseStatus(state) {
    try {
      await this.checkRateLimitAndWait();

      const accessToken = await this.getAccessToken();
      
      // find the row for this state en hoja estados
      const estadosResponse = await this.fetchRange(RANGES.estados, accessToken);
      const estadosRows = estadosResponse.values || [];
      
      // row index for this state (add 1 por 1-based)
      const stateRowIndex = estadosRows.findIndex(row => row[0] === state) + 1;
      
      if (stateRowIndex === 0) {
        throw new Error(`State ${state} not found in estados sheet`);
      }

      // prepara update request
      const updateRequest = {
        valueInputOption: 'RAW',
        data: [
          {
            range: `estados!C${stateRowIndex}`,  
            values: [['1']] 
          },
          {
            range: `estados!D${stateRowIndex}`,
            values: [[new Date().toLocaleDateString('es-MX', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',    
              minute: '2-digit', 
              second: '2-digit'   
          })]] 
          }
        ]
      };

      // update request
      const response = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${SPREADSHEET_ID}/values:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateRequest)
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to update acuse status: ${response.statusText}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Error updating acuse status:', error);
      throw error;
    }
  }

}

const sheetsService = new SheetsService();
export default sheetsService;