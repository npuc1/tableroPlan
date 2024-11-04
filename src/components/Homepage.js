// src/components/Homepage.js
import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Container, Navbar, Button } from 'react-bootstrap';

const Homepage = () => {
  const { loginWithRedirect } = useAuth0();

  return (
    <div>
      <Navbar bg="dark" variant="dark" className="mb-4">
        <Container>
          <Navbar.Brand>Your App Name</Navbar.Brand>
        </Container>
      </Navbar>
      
      <Container className="text-center">
        <h1 className="mb-4">Welcome to Your App</h1>
        <p className="mb-4">Please log in to continue</p>
        <Button 
          variant="primary" 
          size="lg" 
          onClick={() => loginWithRedirect()}
        >
          Log In
        </Button>
      </Container>
    </div>
  );
};

export default Homepage;