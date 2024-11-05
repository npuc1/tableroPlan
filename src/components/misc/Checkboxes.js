import Form from 'react-bootstrap/Form';
import { criterios } from './ListaCriterios';

const Checkboxes = ({
  accion,
  formData,
  currentInstIndex,
  nameInst,
  handleCheckboxCChange,
  validationErrors
}) => {

  return (
    <div className='checkboxbox'>
      {criterios
        .filter(criterio => criterio.accion === Number(accion))
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
  )
};

export default Checkboxes;