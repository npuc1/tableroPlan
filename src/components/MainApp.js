import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Dropdown from 'react-bootstrap/Dropdown';
import React, { useState, useEffect, useCallback } from 'react';
import Table from 'react-bootstrap/Table';
import Modal from 'react-bootstrap/Modal';
import Card from 'react-bootstrap/Card';
import Stack from 'react-bootstrap/Stack';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ProgressBar from 'react-bootstrap/ProgressBar';
import Fade from 'react-bootstrap/Fade';
import { processCSV } from './stateDataLoader';
import ReportConfirmationModal from './modals/ReportConfirmationModal';
import NormativeModificationModal from './modals/NormativeModificationModal';
import NoNormativeModal from './modals/NoNormativeModal';
import Header from './display/HeaderApp';
import Footer from './display/FooterApp';
import LogoutButton from './display/LogoutButton';
import { useAuth0 } from '@auth0/auth0-react';

let instVisit = [0]

const renderTooltip = (props) => (
  <Tooltip id="button-tooltip" {...props}>
    Para consultar las definiciones extendidas de las acciones y criterios, descarge la guía de usuario
  </Tooltip>
);

// creacion de array de objectos para checkboxes de criterios
let criterios = Array.from(Array(12), () => ({ nombreCrit: '', accion: '', posicion: '' }))

const nombresCriterios = [
  "Presupuesto y cronograma",
  "Montos máximos para excepciones",
  "Registro previo de todos los procedimientos",
  "Investigación de mercado obligatoria",
  "Existencia de oferta de bienes y/o servicios",
  "Existencia de proveedores",
  "Precio de bienes y/o servicios",
  "Medios consultados para la investigación",
  "Justificación para la selección de empresas",
  "Soporte documental",
  "Utilización de fraccionamientos*",
  "Incorporación de OIC y área jurídica*",

]

const acciones = [1, 1, 1, 2, 3, 3, 3, 3, 3, 3, 3, 3,];

const posicion = ["1", "2", "3", "1", "1", "2", "3", "4", "5", "6", "7", "8",];

criterios = criterios.map((criterio, index) => ({
  nombreCrit: nombresCriterios[index],
  accion: acciones[index],
  posicion: posicion[index]
}));

function MainApp() {
  // otros
  const [isLoading, setIsLoading] = useState(true);

  const {
    user,
  } = useAuth0();

  const appMetadata = user.app_metadata;

  // objeto default para estados
  const [states, setStates] = useState({
    'default': {
      institutions: [],
      reporteListo: false,
      acuseEmitido: false
    }
  });

  // keep track estado seleccionado
  const [selectedState, setSelectedState] = useState('default'); // formato de un valor en caracter, estadp default para prevenir error en initial load

  // guardar instituciones del estado seleccionado
  const [institutions, setInstitutions] = useState([]); // formato de array para instituciones

  // la institución seleccionada actual, empieza en 0
  const [currentInstIndex, setCurrentInstIndex] = useState(0);

  // data de csv
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        console.log('Starting to load CSV...');
        const response = await fetch('./data/states.csv');

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        console.log('CSV file found, reading content...');
        const csvText = await response.text();
        console.log('CSV content:', csvText);

        const statesData = processCSV(csvText);
        console.log('Processed states data:', statesData);

        if (Object.keys(statesData).length > 0) {
          setStates(statesData);
          const firstState = Object.keys(statesData)[0];
          setSelectedState(firstState);
          setInstitutions(statesData[firstState].institutions || []);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Detailed error in loadInitialData:', error);
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  const getInstitutions = useCallback(() => {
    if (!selectedState || !states[selectedState]) {
      return [];
    }
    return states[selectedState].institutions || [];
  }, [selectedState, states]);

  useEffect(() => {
    const newInstitutions = getInstitutions();
    console.log('Updating institutions for state:', selectedState, newInstitutions);
    setInstitutions(newInstitutions);
  }, [selectedState, getInstitutions]);


  // guarda data del form para cada institucion
  const [formData, setFormData] = useState({}); // formato de objeto

  // constantes para botón de reporte
  const [pendValue, setPendValue] = useState(null);
  const estadoConfirm = [
    { value: '0' },
    { value: '1' },
  ];

  // use states para modales
  const [mostrarModalR, setMostrarModalR] = useState(false);
  const [mostrarModalNormS, setMostrarModalNormS] = useState(false);
  const [mostrarModalNormN, setMostrarModalNormN] = useState(false);
  const [mostrarModalAcuse, setMostrarModalAcuse] = useState(false);

  const handleCloseR = () => setMostrarModalR(false); // handle para cerrar al hacer clic, el handle para mostrar viene en la misma función que el guardado
  const handleCloseNormS = () => setMostrarModalNormS(false);
  const handleCloseNormN = () => setMostrarModalNormN(false);
  const handleCloseModalAcuse = () => {
    setMostrarModalAcuse(false);
    setTimeRemaining(5);
    setIsTimerComplete(false);
  }

  // use states para confirmar reporte y generación de acuses de la SESEA
  const [timeRemaining, setTimeRemaining] = useState(5); // countdown de 5 segundos
  const [isTimerComplete, setIsTimerComplete] = useState(false);

  useEffect(() => {
    let timer;
    if (setMostrarModalAcuse && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      setIsTimerComplete(true);
    }

    return () => {
      clearInterval(timer);
    };
  }, [mostrarModalAcuse, timeRemaining]);

  // useEffect actualiza las instituciones cuando se selecciona un estado
  useEffect(() => {
    if (selectedState) { // if the value is truthy
      setInstitutions(states[selectedState].institutions || []); // setea el array de instituciones como las instituciones del estado seleccinado, si es falsy crea un array vacio

      // datos de form para cada institución
      const initialFormData = {}; // inicializa un objeto vacio
      states[selectedState].institutions.forEach(institution => { // para cada institucion del estado seleccionado
        initialFormData[institution] = { // asigna estas propiedades en el objeto vacio
          reported: false,
          radioValue: '0',
          normModified: false,
          permaMod: false,
          lastSaved: false,
          editable: false,
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

        // crear la lista de propiedades de criterios para cada checkbox dinamicamente
        criterios.forEach(criterio => {
          const propertyName = `${criterio.accion}${criterio.posicion}`;
          initialFormData[institution][propertyName] = false;
        });

      });
      setFormData(initialFormData);
    }
  }, [selectedState, states]);


  // handler para seleccion de estados, aunque es redundante puede ser aplicable si se quiere hacer algo mas al actualizar el valor
  const handleStateSelect = useCallback((state) => {
    console.log('Selecting state:', state);
    if (state && states[state]) {
      setSelectedState(state);
      setCurrentInstIndex(0);
      instVisit = [0];
    }
  }, [states]);

  // handler cambios de checkbox de normatividad
  const handleCheckboxRChange = (institution) => {
    setFormData(prevData => {
      const isUnchecking = prevData[institution].normModified; // extrae el estatus actual para verificar que estamos uncheckeando

      // reset object with all checkboxes set to false
      const resetCheckboxes = {}; // objeto vacío para asignarle todas las propiedades en falso
      criterios.forEach(criterio => {
        const propertyName = `${criterio.accion}${criterio.posicion}`; // crea el nombre de la propiedad a partir de criterios (definido anteirormente)
        resetCheckboxes[propertyName] = false; // asigna todas las propiedades con falso al objeto vacío
      });

      return {
        ...prevData,
        [institution]: {
          ...prevData[institution],
          normModified: !prevData[institution].normModified,
          editable: !prevData[institution].normModified,
          ...(isUnchecking && { // si se está modificando, devuelve todos los valores de reset
            ...resetCheckboxes,
            normName1: "",
            normLink1: "",
            normName2: "",
            normLink2: "",
            normName3: "",
            normLink3: "",
            editableText1: false,
            editableText2: false,
            editableText3: false,
          })
        }
      };
    });
  };

  // handler cambios de checkbox
  const handleCheckboxCChange = (institution, criterio) => {
    // extrae numero de acion del id criterio ("1a" -> "1")
    const action = criterio.charAt(0);
    setFormData(prevData => {
      // siguiente estado del checkbox
      const newCheckboxState = !prevData[institution][criterio];

      // filtrar todos los checkboxes de la acción
      const actionCheckboxes = criterios
        .filter(crit => crit.accion === Number(action))
        .map(crit => `${crit.accion}${crit.posicion}`);

      // verificar si existe algun cambio
      const anyChecked = actionCheckboxes.some(checkboxId => {
        // usar el nuevo estado para el checbox que cambia
        return checkboxId === criterio ?
          newCheckboxState :
          prevData[institution][checkboxId];
      });

      return {
        ...prevData,
        [institution]: {
          ...prevData[institution],
          [criterio]: newCheckboxState,
          [`editableText${action}`]: anyChecked  // propiedad editable si alguna está seleccionada
        }
      };
    });
  };

  // link validation
  const [validationErrors, setValidationErrors] = useState({
    checkboxes: false,
  });

  // verificador de text input para criterios
  const validateFormBeforeSave = (institution) => {
    const institutionData = formData[institution];
    const newErrors = {};

    // para verificación de que aunque sea un criterio se selecciona si se selecciona que se modifica la normatividad
    const anyCheckboxSelected = criterios
      .some(criterio => institutionData[`${criterio.accion}${criterio.posicion}`] === true);

    if (!anyCheckboxSelected) {
      newErrors.checkboxes = true;
    }

    // acciones para validar
    const accEsp = [1, 2, 3,];

    accEsp.forEach(action => {
      // generar los id de checkboxes para esta acción
      const accCheckboxes = criterios
        .filter(criterio => criterio.accion === action)
        .map(criterio => `${criterio.accion}${criterio.posicion}`);

      // verificación de modificación de por lo menos un criterio por acción
      const modifCriterio = accCheckboxes.some(checkboxId =>
        institutionData[checkboxId] === true
      );

      // si se modificó un criterio y no hay links o nombres (después de quitar espacios) genera la propiedad de error
      if (modifCriterio) {
        if (!institutionData[`normName${action}`]?.trim()) {
          newErrors[`name${action}`] = true;
        } if (!institutionData[`normLink${action}`]?.trim()) {
          newErrors[`link${action}`] = true;
        }
      }
    });

    // set nuevos errores (cuando las condiciones se cumplen)
    setValidationErrors(newErrors);

    // true if no errors, false otherwise
    return Object.keys(newErrors).length === 0;
  };

  // errores para links
  const errName = "Introduzca el nombre de la normatividad"
  const errLink = "Introduzca el enlace a la normatividad"
  const errCrit = "Seleccione por lo menos un criterio impactado por la modificación normativa"

  // handler para cambios en input fields
  const handleInputChange = (institution, field, value) => {
    setFormData(prevData => ({
      ...prevData,
      [institution]: {
        ...prevData[institution],
        [field]: value
      }
    }));
  };

  // handler toggle value
  const handleReportToggle = (radioVal, institution) => {
    if (formData[institution].radioValue === '0') {
      handleModalR();
      setPendValue(radioVal);
    } else if (formData[institution].radioValue === '1') {
      setFormData(prevData => ({
        ...prevData,
        [institution]: {
          ...prevData[institution],
          reported: !prevData[institution].reported,
          radioValue: '0',
        }
      }));
      handleCheckboxRChange(institution);
    }
    console.log(formData[institution].reported);
    console.log(formData[institution].radioValue)
  }

  // handler modal reporte
  const handleModalR = () => {
    setMostrarModalR(true);
  }

  // handler boton confirmar reporte modal
  const handleReport = (institution) => {
    setFormData(prevData => ({
      ...prevData,
      [institution]: {
        ...prevData[institution],
        reported: !prevData[institution].reported,
        radioValue: pendValue
      }
    }));
    setMostrarModalR(false);
  };

  // handler timer
  const handleAcuseClick = () => {
    setMostrarModalAcuse(true)
    setTimeRemaining(5)
    setIsTimerComplete(false)
  }

  // handler acuse
  const handleAcuse = () => {
    setMostrarModalAcuse(false);
    setStates(prevStates => ({
      ...prevStates,
      [selectedState]: {
        ...prevStates[selectedState],
        acuseEmitido: true
      }
    }));
  };

  // handler modal guardado
  const handleModalNorm = (normMod, inst, permod) => {
    if (normMod === true) {
      handleSaveNormSMod(inst, permod)
    } else {
      setMostrarModalNormN(true)
    }
  }

  // handlers para siguiente y anterior institución
  const handleNextInst = () => {
    // update current index
    setCurrentInstIndex(prevIndex => {
      const newIndex = prevIndex + 1;

      // update visited institutions
      if (noInst() > instVisit[instVisit.length - 1]) {
        instVisit.push(noInst());
      }

      // all institutions check
      if (instVisit.length === institutions.length) {
        setStates(prevStates => ({
          ...prevStates,
          [selectedState]: {
            ...prevStates[selectedState],
            reporteListo: true
          }
        }));
      }

      return newIndex;
    });

    console.log('Current institutions visited:', instVisit);
    console.log('Total institutions:', institutions.length);
    console.log('Report ready status:', states[selectedState].reporteListo);
  };

  const handlePrevInst = () => {
    setCurrentInstIndex(prevIndex => prevIndex - 1);
  };

  // función para generar el numero verdadero de institución
  const noInst = useCallback(() => {
    return currentInstIndex + 1;
  }, [currentInstIndex]);

  // función para generar nombre de la institución
  const nameInst = useCallback((index) => {
    if (!institutions || index >= institutions.length) {
      return '';
    }
    return institutions[index];
  }, [institutions]);


  // funcion handle save con modificacion normativa
  const handleSaveNormS = (inst) => {
    setFormData(prevData => ({
      ...prevData,
      [inst]: {
        ...prevData[inst],
        permaMod: false,
        lastSaved: true,
        editable: false,
      }
    }));
    setMostrarModalNormS(false);
    console.log(formData[inst]);
  }

  // handle modal mod norm
  const handleSaveNormSMod = (inst, permod) => {
    const isValid = validateFormBeforeSave(inst);

    if (isValid) {
      if (permod === false) {
        setMostrarModalNormS(true)
      } else if (permod === true) {
        handleSaveNormS(inst)
      }
    }
  }

  const handleSaveNormN = (inst) => {
    setFormData(prevData => ({
      ...prevData,
      [inst]: {
        ...prevData[inst],
        lastSaved: true,
      }
    }));
    setMostrarModalNormN(false);
  }

  const handleEdit = (inst, normod) => {
    if (normod === true) {
      setFormData(prevData => ({
        ...prevData,
        [inst]: {
          ...prevData[inst],
          editable: !prevData[inst].editable,
          lastSaved: false,
        }
      }));
    } else if (normod === false) {
      setFormData(prevData => ({
        ...prevData,
        [inst]: {
          ...prevData[inst],
          lastSaved: false,
        }
      }));
    }
  };

  if (isLoading) {
    return <div>Loading state data...</div>;
  }

  // Safety check for required data
  if (!selectedState || !states[selectedState]) {
    return <div>Loading state information...</div>;
  }

  if (states[selectedState].acuseEmitido === false) {
    return (
      <>
        <div className="min-vh-100 w-100 position-relative">
          <div>
            <Dropdown>
              <Dropdown.Toggle variant='info' id='selectorEstados'>
                {selectedState === 'default' ? 'Select State' : selectedState}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                {Object.keys(states)
                  .filter(state => state !== 'default')
                  .map(state => (
                    <Dropdown.Item key={state} onClick={() => handleStateSelect(state)}>
                      {state}
                    </Dropdown.Item>
                  ))}
              </Dropdown.Menu>
            </Dropdown>

            <LogoutButton />

            <div>
              {appMetadata && (
                <div>
                  {appMetadata.estado && <p>{appMetadata.estado}</p>}
                </div>
              )}
            </div>

            <Header />
          </div>

          <ReportConfirmationModal
            show={mostrarModalR}
            onClose={() => handleCloseR()}
            onConfirm={handleReport}
            institutionName={nameInst(currentInstIndex)}
          />

          <NormativeModificationModal
            show={mostrarModalNormS}
            onClose={() => handleCloseNormS()}
            onConfirm={handleSaveNormS}
            institutionName={nameInst(currentInstIndex)}
          />

          <NoNormativeModal
            show={mostrarModalNormN}
            onClose={() => handleCloseNormN()}
            onConfirm={handleSaveNormN}
            institutionName={nameInst(currentInstIndex)}
          />

          <Modal
            show={mostrarModalAcuse}
            onHide={handleCloseModalAcuse}
            backdrop='static'
            keyboard={false}
          >
            <Modal.Header>
              <Modal.Title>Confirmación de finalización de reporte</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p>¿Desea finalizar su reporte y generar su acuse? No podrá seguir editando sus respuestas ni modificar la información enviada.</p>

              <div className="mt-3">
                <ProgressBar
                  now={(5 - timeRemaining) * 20}
                />
                <p className="text-muted text-center mt-2">
                  {timeRemaining > 0
                    ? `Para confirmar, espere ${timeRemaining} segundos`
                    : 'Ahora puede confirmar'}
                </p>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant='secondary'
                onClick={() => handleCloseModalAcuse()}>
                Cancelar
              </Button>
              <Button
                variant='primary'
                onClick={() => handleAcuse()}
                disabled={!isTimerComplete}>
                Confirmar y descargar acuse
              </Button>
            </Modal.Footer>
          </Modal>

          <div className='card-container'>
            <Card>
              <Card.Body>
                <Card.Title>
                  <div>
                    {nameInst(currentInstIndex)}
                    <div style={{ 'color': '#808080', 'fontSize': '16px', 'paddingTop': '5px' }}>
                      {noInst()} of {institutions.length}
                    </div>
                  </div>
                  <div style={{ 'paddingTop': '10px' }}>
                    {nameInst(currentInstIndex) && (
                      <ButtonGroup>
                        {estadoConfirm.map((radio, idx) => (
                          <ToggleButton
                            key={idx}
                            id={`radio-${idx}`}
                            type="radio"
                            variant={idx % 2 ? 'outline-primary' : 'outline-secondary'}
                            name="radio"
                            value={radio.value}
                            checked={radio.value === formData[nameInst(currentInstIndex)]?.radioValue}
                            onChange={(e) => handleReportToggle(e.currentTarget.value, nameInst(currentInstIndex))}
                          >
                            {idx % 2 ? (formData[nameInst(currentInstIndex)]?.radioValue === '1' ? 'Reporte confirmado' : 'Confirmar reporte') : 'Sin reporte'}
                          </ToggleButton>
                        ))}
                      </ButtonGroup>
                    )}
                  </div>
                  <div
                    style={{ 'paddingTop': '10px', 'textAlign': 'right' }}>
                    <Button
                      variant="link"
                      onClick={handlePrevInst}
                      disabled={currentInstIndex === 0}>
                      Anterior
                    </Button>
                    <Button
                      variant="link"
                      onClick={handleNextInst}
                      disabled={currentInstIndex === states[selectedState].institutions.length - 1}>
                      Siguiente
                    </Button>
                  </div>
                </Card.Title>
                {formData[nameInst(currentInstIndex)]?.reported && (<Card.Text>
                  <hr></hr>
                  <Form.Check
                    style={{ 'padding-bottom': '10px' }}
                    label="La normatividad considera los criterios del Plan de Acción"
                    checked={formData[nameInst(currentInstIndex)]?.normModified || false}
                    onChange={() => handleCheckboxRChange(nameInst(currentInstIndex))}
                    disabled={formData[nameInst(currentInstIndex)]?.permaMod || ((formData[nameInst(currentInstIndex)]?.lastSaved) && (!formData[nameInst(currentInstIndex)]?.normMod))}
                  />
                  <Table bordered className='tablaReporte'>
                    <thead>
                      <tr>
                        <th
                          colSpan={3}>
                          <div class='parent'>
                            <div
                              class='child'
                              style={{ 'fontSize': '16px', 'color': '#6e606a' }}>
                              Acciones específicas
                            </div>
                            <div class='child extra-pad'>
                              <OverlayTrigger
                                placement="right"
                                delay={{ show: 150, hide: 100 }}
                                overlay={renderTooltip}>
                                {<button class='btn-custom rounded-circle' style={{ 'fontSize': '10px' }}>?</button>}
                              </OverlayTrigger>
                            </div>
                          </div>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>3.1 Criterios PAAAS</td>
                        <td>3.2 Investigación de mercado</td>
                        <td>3.3 Criterios de Investigación de mercado</td>
                      </tr>
                      <tr>
                        <td>
                          <div className='checkboxbox'>
                            {criterios
                              .filter(criterio => criterio.accion === 1)
                              .map((criterio) => {
                                const checkboxId = `${criterio.accion}${criterio.posicion}`;
                                return (
                                  <Form.Check
                                    key={checkboxId}
                                    label={`${criterio.posicion}. ${criterio.nombreCrit}`}
                                    id={checkboxId}
                                    checked={formData[nameInst(currentInstIndex)]?.[checkboxId]}
                                    disabled={!formData[nameInst(currentInstIndex)]?.editable}
                                    onChange={(e) => handleCheckboxCChange(nameInst(currentInstIndex), e.target.id)}
                                    isInvalid={validationErrors.checkboxes} />
                                )
                              })}
                          </div>
                        </td>
                        <td>
                          <div className='checkboxbox'>
                            {criterios
                              .filter(criterio => criterio.accion === 2)
                              .map((criterio) => {
                                const checkboxId = `${criterio.accion}${criterio.posicion}`;
                                return (
                                  <Form.Check
                                    key={checkboxId}
                                    label={`${criterio.posicion}. ${criterio.nombreCrit}`}
                                    id={checkboxId}
                                    checked={formData[nameInst(currentInstIndex)]?.[checkboxId]}
                                    disabled={!formData[nameInst(currentInstIndex)]?.editable}
                                    onChange={(e) => handleCheckboxCChange(nameInst(currentInstIndex), e.target.id)}
                                    isInvalid={validationErrors.checkboxes} />  // hace roja la etiqueta className={validationErrors.checkboxes ? 'text-danger' : ''}
                                )
                              })}
                          </div>
                        </td>
                        <td>
                          <div className='checkboxbox'>
                            {criterios
                              .filter(criterio => criterio.accion === 3)
                              .map((criterio) => {
                                const checkboxId = `${criterio.accion}${criterio.posicion}`;
                                return (
                                  <Form.Check
                                    key={checkboxId}
                                    label={`${criterio.posicion}. ${criterio.nombreCrit}`}
                                    id={checkboxId}
                                    checked={formData[nameInst(currentInstIndex)]?.[checkboxId]}
                                    disabled={!formData[nameInst(currentInstIndex)]?.editable}
                                    onChange={(e) => handleCheckboxCChange(nameInst(currentInstIndex), e.target.id)}
                                    isInvalid={validationErrors.checkboxes} />
                                )
                              })}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <div className='enlacesContainer'>

                            <Form.Control
                              id="inputName1"
                              type="text"
                              placeholder='Nombre de la normatividad aplicable'
                              value={formData[nameInst(currentInstIndex)]?.normName1 || ''} // usa optional chaining para acceder al nombre de manera segura
                              onChange={(e) => handleInputChange(nameInst(currentInstIndex), 'normName1', e.target.value)} // pasa los tres argumentos necesarios al handler del input
                              disabled={!formData[nameInst(currentInstIndex)]?.editableText1 || formData[nameInst(currentInstIndex)]?.lastSaved}
                              maxLength={200}
                              accion="1"
                              isInvalid={validationErrors.name1}
                            />
                            {validationErrors.name1 && (
                              <Form.Control.Feedback type="invalid" className='feedback-message'>
                                {errName}
                              </Form.Control.Feedback>)}
                            <Form.Control
                              id="inputLink1"
                              type="text"
                              placeholder='Enlace a la normatividad aplicable'
                              value={formData[nameInst(currentInstIndex)]?.normLink1 || ''}
                              onChange={(e) => handleInputChange(nameInst(currentInstIndex), 'normLink1', e.target.value)}
                              disabled={!formData[nameInst(currentInstIndex)]?.editableText1 || formData[nameInst(currentInstIndex)]?.lastSaved}
                              maxLength={200}
                              accion="1"
                              isInvalid={validationErrors.link1}
                            />
                            {validationErrors.link1 && (
                              <Form.Control.Feedback type="invalid" className='feedback-message'>
                                {errLink}
                              </Form.Control.Feedback>)}
                          </div>
                        </td>
                        <td>
                          <div className='enlacesContainer'>
                            <Form.Control
                              id="inputName2"
                              type="text"
                              placeholder='Nombre de la normatividad aplicable'
                              value={formData[nameInst(currentInstIndex)]?.normName2 || ''} // usa optional chaining para acceder al nombre de manera segura
                              onChange={(e) => handleInputChange(nameInst(currentInstIndex), 'normName2', e.target.value)} // pasa los tres argumentos necesarios al handler del input
                              disabled={!formData[nameInst(currentInstIndex)]?.editableText2 || formData[nameInst(currentInstIndex)]?.lastSaved}
                              maxLength={200}
                              accion="2"
                              isInvalid={validationErrors.name2}
                            />
                            {validationErrors.name2 && (
                              <Form.Control.Feedback type="invalid" className='feedback-message'>
                                {errName}
                              </Form.Control.Feedback>)}
                            <Form.Control
                              id="inputLink2"
                              type="text"
                              placeholder='Enlace a la normatividad aplicable'
                              value={formData[nameInst(currentInstIndex)]?.normLink2 || ''}
                              onChange={(e) => handleInputChange(nameInst(currentInstIndex), 'normLink2', e.target.value)} // usa la misma funcion gracias al campo computado [field] de la definicion de la funcion            
                              disabled={!formData[nameInst(currentInstIndex)]?.editableText2 || formData[nameInst(currentInstIndex)]?.lastSaved}
                              maxLength={200}
                              accion="2"
                              isInvalid={validationErrors.link2}
                            />
                            {validationErrors.link2 && (
                              <Form.Control.Feedback type="invalid" className='feedback-message'>
                                {errLink}
                              </Form.Control.Feedback>)}
                          </div>
                        </td>
                        <td>
                          <div className='enlacesContainer'>
                            <Form.Control
                              id="inputName3"
                              type="text"
                              placeholder='Nombre de la normatividad aplicable'
                              value={formData[nameInst(currentInstIndex)]?.normName3 || ''} // usa optional chaining para acceder al nombre de manera segura
                              onChange={(e) => handleInputChange(nameInst(currentInstIndex), 'normName3', e.target.value)} // pasa los tres argumentos necesarios al handler del input
                              disabled={!formData[nameInst(currentInstIndex)]?.editableText3 || formData[nameInst(currentInstIndex)]?.lastSaved}
                              accion="3"
                              isInvalid={validationErrors.name3}
                            />
                            {validationErrors.name3 && (
                              <Form.Control.Feedback type="invalid" className='feedback-message'>
                                {errName}
                              </Form.Control.Feedback>)}
                            <Form.Control
                              id="inputLink3"
                              type="text"
                              placeholder='Enlace a la normatividad aplicable'
                              value={formData[nameInst(currentInstIndex)]?.normLink3 || ''}
                              onChange={(e) => handleInputChange(nameInst(currentInstIndex), 'normLink3', e.target.value)} // usa la misma funcion gracias al campo computado [field] de la definicion de la funcion           
                              disabled={!formData[nameInst(currentInstIndex)]?.editableText3 || formData[nameInst(currentInstIndex)]?.lastSaved}
                              accion="3"
                              isInvalid={validationErrors.link3}
                            />
                            {validationErrors.link3 && (
                              <Form.Control.Feedback type="invalid" className='feedback-message'>
                                {errLink}
                              </Form.Control.Feedback>)}
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                  <div style={{ 'textAlign': 'right', 'padding-right': '10px', 'fontSize': '14px' }}>
                    *Criterio opcional
                  </div>
                  <hr></hr>
                  <Stack gap={1} className="buttonContainer">
                    <div className="text-danger" textAlign="center">{validationErrors.checkboxes && errCrit}</div>
                    <Button
                      onClick={() => handleModalNorm(formData[nameInst(currentInstIndex)]?.normModified, nameInst(currentInstIndex), formData[nameInst(currentInstIndex)]?.permaMod)}
                      disabled={formData[nameInst(currentInstIndex)]?.lastSaved}>
                      Guardar
                    </Button>
                    <Button
                      onClick={() => handleEdit(nameInst(currentInstIndex), formData[nameInst(currentInstIndex)]?.normModified)}
                      disabled={!formData[nameInst(currentInstIndex)]?.lastSaved}>
                      Editar
                    </Button>
                  </Stack>
                </Card.Text>)}
                {states[selectedState].reporteListo && (
                  <Fade
                    in={states[selectedState].reporteListo}
                    appear={true}>
                    <div style={{ 'display': 'flex', 'justifyContent': 'center', }}>
                      <Button
                        variant='warning'
                        onClick={() => handleAcuseClick()}>
                        Generar acuse
                      </Button>
                    </div>
                  </Fade>
                )}
              </Card.Body>
            </Card>
          </div>
          <Footer />
        </div>
      </>
    );
  } else if (states[selectedState].acuseEmitido === true) {
    return (
      <>
        <div className="min-vh-100 w-100 overflow-auto">
          <Header />
          <div className='postAcuse'>
            <Card>
              <Card.Body>
                <Card.Title></Card.Title>
                <Card.Text><div>Su reporte ha sido enviado.</div>
                  <div style={{ 'paddingTop': '20px', 'display': 'flex', 'justifyContent': 'center', }}><Button
                    variant='warning'>Descargar acuse</Button></div>
                </Card.Text>
              </Card.Body>
            </Card>
          </div>
          <Footer />
        </div>
      </>
    )
  }
};

export default MainApp;