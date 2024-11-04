// src/components/Homepage.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Button } from 'react-bootstrap';
import Header from './display/HeaderApp';

const Homepage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <Header/>
      
      <Container className="text-center" style={{ 'paddingTop': '80px', }}>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => loginWithRedirect()}
        >
          Iniciar sesión
        </Button>
      </Container>
    </div>
  );
};

export default Homepage;