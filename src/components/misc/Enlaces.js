import Form from 'react-bootstrap/Form';

const Enlaces = ({
  accion,
  formData,
  currentInstIndex,
  nameInst,
  handleInputChange,
  validationErrors
}) => {

  const errName = "Introduzca el nombre de la normatividad"
  const errLink = "Introduzca el enlace a la normatividad"
  const errURL = "La URL introducida no es válida"

  return (
    <div className='enlacesContainer'>

      <Form.Control
        id={`inputName${accion}`}
        type="text"
        placeholder='Nombre de la normatividad aplicable'
        value={formData[nameInst(currentInstIndex)]?.[`normName${accion}`] || ''} // usa optional chaining para acceder al nombre de manera segura
        onChange={(e) => handleInputChange(nameInst(currentInstIndex), `normName${accion}`, e.target.value)} // pasa los tres argumentos necesarios al handler del input
        disabled={!formData[nameInst(currentInstIndex)]?.[`editableText${accion}`] || formData[nameInst(currentInstIndex)]?.lastSaved}
        maxLength={200}
        accion={accion}
        isInvalid={validationErrors?.[`name${accion}`]}
      />
      {validationErrors?.[`name${accion}`] && (
        <Form.Control.Feedback type="invalid" className='feedback-message'>
          {errName}
        </Form.Control.Feedback>)}
      <Form.Control
        id={`inputLink${accion}`}
        type="text"
        placeholder='Enlace a la normatividad aplicable'
        value={formData[nameInst(currentInstIndex)]?.[`normLink${accion}`] || ''}
        onChange={(e) => handleInputChange(nameInst(currentInstIndex), `normLink${accion}`, e.target.value)}
        disabled={!formData[nameInst(currentInstIndex)]?.[`editableText${accion}`] || formData[nameInst(currentInstIndex)]?.lastSaved}
        maxLength={200}
        accion={accion}
        isInvalid={validationErrors?.[`link${accion}`] || validationErrors?.[`url${accion}`]}
      />
      {(validationErrors?.[`link${accion}`] || validationErrors?.[`url${accion}`]) && (
        <Form.Control.Feedback type="invalid" className='feedback-message'>
          {validationErrors?.[`link${accion}`] ? errLink :
            validationErrors?.[`url${accion}`] ? errURL :
              "Error"}
        </Form.Control.Feedback>)}
    </div>
  )

}

export default Enlaces;