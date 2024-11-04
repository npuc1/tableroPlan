import { BsLink45Deg } from 'react-icons/bs';
import { BsCloudDownload } from 'react-icons/bs';
import Button from 'react-bootstrap/Button';

const Header = () => {return (
    
    <div>
    <div className='header'>

      <div style={{ 'textAlign': 'left', 'paddingBottom': '0px', }}>
        <a
          href="https://www.sna.org.mx/"
          target="_blank"
          rel="noopener noreferrer">
          <img
            src="/logo-SNA.svg"
            alt="Sistema Nacional Anticorrupción"
            style={{ 'width': '300px', 'height': 'auto' }} />
        </a>
      </div>

      <h1 className='title1'>
        Tablero de reporte
      </h1>
      <h4 className='title2'>
        Plan de Acción para fortalecer los procesos de contrataciones públicas <br></br> en materia de adquisiciones, arrendamientos y servicios
      </h4>
      <h5 className='instruccion'>
        Acción 3: Homologación de normatividad
      </h5>
    </div>
    <div className='linkBox'>
      <Button
        variant='secondary'
        href='https://www.sna.org.mx/wp-content/uploads/2024/04/Plan-de-Accion-contrataciones-publicas_250324.pdf'
        target='_blank'>
        Plan de Acción <BsLink45Deg />
      </Button>
      <Button variant='secondary'>
        Guía de usuario <BsCloudDownload />
      </Button>
    </div>
  </div>
)};

export default Header;