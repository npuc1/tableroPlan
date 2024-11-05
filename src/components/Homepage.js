// src/components/Homepage.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import Header from './display/HeaderApp';
import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';

const Homepage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <Header />

      <div className='postAcuse'>
        <Card>
          <Card.Body>
            <Card.Title></Card.Title>
            <Card.Text><div style={{ 'textAlign': 'center', }}>Para continuar ingrese sus credenciales.</div>
              <div style={{ 'paddingTop': '30px', 'display': 'flex', 'justifyContent': 'center', }}>
                <Button
                  variant="primary"
                  onClick={() => loginWithRedirect()}
                >
                  Iniciar sesión
                </Button></div>
            </Card.Text>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
};

export default Homepage;