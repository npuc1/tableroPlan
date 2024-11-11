import { useState, useEffect } from 'react';
import sheetsService from '../../services/sheetsService';
import { criterios } from '../misc/ListaCriterios';

const GoogleSheetsInit = ({ 
  appMetadata, 
  setStates, 
  setIsLoading, 
  setDataInitialized,
  setFormData 
}) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        const {
          stateData,
          instTrackingData,
          criteriosData,
          accionesData
        } = await sheetsService.fetchAllData(appMetadata.estado);

        console.log('Fetched Sheet Data:', {
          stateData,
          instTrackingData,
          criteriosData,
          accionesData
        });

        // Update states with status data
        setStates(prevStates => ({
          ...prevStates,
          [appMetadata.estado]: {
            ...prevStates[appMetadata.estado],
            reporteListo: stateData.reporteListo,
            acuseEmitido: stateData.acuseEmitido
          }
        }));

        // Initialize form data
        setFormData(prevData => {
          const newData = {};
          
          // For each institution in tracking data
          Object.keys(instTrackingData).forEach(institution => {
            // Get the tracking data for this institution
            const tracking = instTrackingData[institution];
            
            // Get the criterios data for this institution
            const instCriterios = criteriosData[institution] || [];
            
            // Get the acciones data for this institution
            const instAcciones = accionesData[institution] || {};

            // Initialize the institution data structure
            newData[institution] = {
              // Base form structure
              reported: tracking.reported || false,
              radioValue: tracking.radioValue || '0',
              normModified: tracking.normModified || false,
              lastSaved: tracking.lastSaved || false,
              editable: tracking.editable || false,
              normName1: '',
              normLink1: '',
              normName2: '',
              normLink2: '',
              normName3: '',
              normLink3: '',
              editableText1: false,
              editableText2: false,
              editableText3: false,
            };

            // Initialize all criterios as false
            criterios.forEach(criterio => {
              const key = `${criterio.accion}${criterio.posicion}`;
              newData[institution][key] = false;
            });

            // Apply criterios data
            instCriterios.forEach(crit => {
              const key = `${crit.accion}${crit.criterio}`;
              newData[institution][key] = crit.modificado;

              // If any criterio is modified for this action, set editableText to true
              if (crit.modificado) {
                newData[institution][`editableText${crit.accion}`] = true;
              }
            });

            // Apply acciones data
            Object.keys(instAcciones).forEach(actionNum => {
              const docs = instAcciones[actionNum];
              if (docs && docs.length > 0) {
                newData[institution][`normName${actionNum}`] = docs[0].nombre || '';
                newData[institution][`normLink${actionNum}`] = docs[0].enlace || '';
                if (docs[0].nombre || docs[0].enlace) {
                  newData[institution][`editableText${actionNum}`] = true;
                }
              }
            });

            // Double-check editableText flags based on normModified
            if (tracking.normModified) {
              [1, 2, 3].forEach(action => {
                const actionCriterios = criterios
                  .filter(crit => crit.accion === action)
                  .map(crit => `${crit.accion}${crit.posicion}`);
                
                const hasSelectedCriteria = actionCriterios.some(
                  criterioKey => newData[institution][criterioKey]
                );

                if (hasSelectedCriteria) {
                  newData[institution][`editableText${action}`] = true;
                }
              });
            }
          });

          console.log('Initialized Form Data:', newData);
          return newData;
        });

        setDataInitialized(true);

      } catch (err) {
        console.error('Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [appMetadata.estado, setStates, setIsLoading, setDataInitialized, setFormData]);

  return error ? <div>Error initializing data: {error}</div> : null;
};

export default GoogleSheetsInit;