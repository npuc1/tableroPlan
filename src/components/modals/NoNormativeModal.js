import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const NoNormativeModal = ({
    show,
    onClose,
    onConfirm,
    institutionName
}) => {
    return (
        <Modal
            show={show}
            onHide={onClose}
            backdrop="static"
            keyboard={false}
        >
            <Modal.Header>
                <Modal.Title>Normatividad aplicable</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Desea confirmar que esta institución NO considera ningún criterio del Plan de Acción en su normatividad?
                Podrá cambiar su respuesta hasta antes de concluir el reporte.
            </Modal.Body>
            <Modal.Footer>
                <Button
                    variant="secondary"
                    onClick={onClose}
                >
                    Cancelar
                </Button>
                <Button
                    variant="primary"
                    onClick={() => onConfirm(institutionName)}
                >
                    Confirmar
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default NoNormativeModal;