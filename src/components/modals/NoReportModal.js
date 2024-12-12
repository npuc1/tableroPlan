import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const NoReportModal = ({
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
                <Modal.Title>Sin reporte</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                ¿Desea confirmar que esta institución NO reporta información al Plan de Acción?
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

export default NoReportModal;