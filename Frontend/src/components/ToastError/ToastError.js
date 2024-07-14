import { ToastContainer, Toast } from "react-bootstrap";

function ToastError({ show, setShow, text }) {
    return (
        <ToastContainer
            className="p-3"
            position={'bottom-end'}
            style={{ zIndex: 10000 }}>
            <Toast
                onClose={() => setShow(false)} show={show} delay={3000} autohide
            >
                <Toast.Header style={{ background: '#ff6347', color: 'white' }} closeButton={false}>
                    <strong className="me-auto">Error</strong>
                    <small>agora</small>
                </Toast.Header>
                <Toast.Body style={{ background: '#ff6347', color: 'white' }}>{text}</Toast.Body>
            </Toast>
        </ToastContainer>
    )
}

export default ToastError