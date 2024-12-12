// RateLimitModal.js
import React, { useEffect, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import ProgressBar from 'react-bootstrap/ProgressBar';

const RateLimitModal = ({ show, waitTime, onClose }) => {
  // Initialize timeRemaining when the modal shows or waitTime changes
  useEffect(() => {
    if (show) {
      setTimeRemaining(waitTime);
    }
  }, [show, waitTime]);

  const [timeRemaining, setTimeRemaining] = useState(waitTime);

  useEffect(() => {
    let timer = null;

    // Only start the timer if the modal is shown and we have time remaining
    if (show && timeRemaining > 0) {
      // Create an interval that runs every second
      timer = setInterval(() => {
        setTimeRemaining((prevTime) => {
          // When we reach 0, clear the interval and close the modal
          if (prevTime <= 1) {
            clearInterval(timer);
            onClose();
            return 0;
          }
          // Otherwise, decrease the time by 1 second
          return prevTime - 1;
        });
      }, 1000);
    }

    // Cleanup function to clear the interval when the component unmounts
    // or when dependencies change
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [show, onClose, timeRemaining]); // Dependencies that should trigger useEffect

  // Calculate progress for the progress bar (from 0 to 100)
  const progress = Math.max(0, Math.min(100, ((waitTime - timeRemaining) / waitTime) * 100));

  return (
    <Modal 
      show={show} 
      onHide={onClose} 
      backdrop="static" 
      keyboard={false}
      centered
    >
      <Modal.Header>
        <Modal.Title>Límite de solicitudes alcanzado</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>
          Para proteger el servicio y evitar sobrecargas, necesitamos esperar un momento 
          antes de continuar. Por favor, espere {timeRemaining} segundos.
        </p>
        <div className="mt-3">
          <ProgressBar 
            now={progress} 
            animated
          />
          <p className="text-muted text-center mt-2">
            {timeRemaining > 0
              ? `Tiempo restante: ${timeRemaining} segundos`
              : 'Puede continuar'}
          </p>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button 
          variant="primary" 
          onClick={onClose}
          disabled={timeRemaining > 0}
        >
          {timeRemaining > 0 ? 'Esperando...' : 'Continuar'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default RateLimitModal;