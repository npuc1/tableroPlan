import { BsLink45Deg } from 'react-icons/bs';
import { BsCloudDownload } from 'react-icons/bs';
import Button from 'react-bootstrap/Button';
import { useAuth0 } from '@auth0/auth0-react';
import LogoutButton from './LogoutButton';
import Dropdown from 'react-bootstrap/Dropdown';
import DescargaManual from '../../services/DescargaManual';

const Header = ({
  appMetadata,
  selectedState,
  states,
  handleStateSelect,
  isLoadingStates
}) => {

  const { isAuthenticated } = useAuth0();

  return (

    <div>
      <div className='header'>

        <div style={{
          'display': 'flex',
          'justifyContent': 'space-between',
          'alignItems': 'center',
          'paddingBottom': '0px'
        }}>
          <a
            href="https://www.sna.org.mx/"
            target="_blank"
            rel="noopener noreferrer">
            <img
              src="/logo-SNA.svg"
              alt="Sistema Nacional Anticorrupción"
              style={{ 'width': '300px', 'height': 'auto' }} />
          </a>
          {isAuthenticated && (<LogoutButton />)}
        </div>

        <h1 className='title1'>
          Tablero de Reporte
        </h1>
        <h4 className='title2'>
          Plan de Acción para fortalecer los procesos de contrataciones públicas <br></br> en materia de adquisiciones, arrendamientos y servicios del sector público
        </h4>
        <h5 className='instruccion'>
          Acción 3: Homologación de normatividad
        </h5>
        <div className='linkBox'>
          <Button
            variant='secondary'
            href='https://www.sna.org.mx/wp-content/uploads/2024/04/Plan-de-Accion-contrataciones-publicas_250324.pdf'
            target='_blank'>
            Plan de Acción <BsLink45Deg />
          </Button>
          <Button 
          variant='secondary'
          onClick={() => DescargaManual()}>
            Manual de usuario <BsCloudDownload />
          </Button>
          {(isAuthenticated && appMetadata.rol === "admin") && <Dropdown>
            <Dropdown.Toggle 
              variant='info' 
              id='selectorEstados'
              disabled={isLoadingStates}>
              {selectedState === 'default' ? 'Select State' : selectedState}
            </Dropdown.Toggle>

            <Dropdown.Menu>
              {Object.keys(states)
                .filter(state => state !== 'default')
                .map(state => (
                  <Dropdown.Item 
                  key={state} 
                  onClick={() => handleStateSelect(state)}
                  active={state === selectedState}>
                    {state}
                  </Dropdown.Item>
                ))}
            </Dropdown.Menu>
          </Dropdown>}
        </div>
      </div>
    </div>
  )
};

export default Header;