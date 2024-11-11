import { useState, useEffect } from 'react';
import sheetsService from '../../services/sheetsService';
import { criterios } from '../misc/ListaCriterios';

const GoogleSheetsInit = ({ 
  selectedState, 
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
        } = await sheetsService.fetchAllData(selectedState);

        const institutionsList = Object.keys(instTrackingData);

        setStates(prevStates => ({
          ...prevStates,
          [selectedState]: {
            ...prevStates[selectedState],
            institutions: institutionsList, 
            reporteListo: stateData.reporteListo,
            acuseEmitido: stateData.acuseEmitido
          }
        }));

        console.log('Fetched Sheet Data:', {
          stateData,
          instTrackingData,
          criteriosData,
          accionesData
        });

        // update states with status data
        setStates(prevStates => ({
          ...prevStates,
          [selectedState]: {
            ...prevStates[selectedState],
            reporteListo: stateData.reporteListo,
            acuseEmitido: stateData.acuseEmitido
          }
        }));

        // initialize form data
        setFormData(prevData => {
          const newData = {};
          
          Object.keys(instTrackingData).forEach(institution => {
            // tracking data for this institution
            const tracking = instTrackingData[institution];
            
            // criterios data for this institution
            const instCriterios = criteriosData[institution] || [];
            
            // acciones data for this institution
            const instAcciones = accionesData[institution] || {};

            // initialize inst data structure
            newData[institution] = {
              // base form structure
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

            // initialize all criterios as false
            criterios.forEach(criterio => {
              const key = `${criterio.accion}${criterio.posicion}`;
              newData[institution][key] = false;
            });

            // criterios data
            instCriterios.forEach(crit => {
              const key = `${crit.accion}${crit.criterio}`;
              newData[institution][key] = crit.modificado;

              // if criterio is modified, set editableText to true
              if (crit.modificado) {
                newData[institution][`editableText${crit.accion}`] = true;
              }
            });

            // acciones data
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

            // double-check editableText flags 
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
  }, [selectedState, setStates, setIsLoading, setDataInitialized, setFormData]);

  return error ? <div>Error initializing data: {error}</div> : null;
};

export default GoogleSheetsInit;