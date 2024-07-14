import './ModalYesNo.css';
import { Modal } from 'react-bootstrap';


function ModalYesNo({ onHide, image, show, setShow, confirmFunction, confirmText, negText, title, subtitle }) {
    const defaultYes = confirmText ? confirmText : "Sim"
    const defaultNo = negText ? negText : "Não"

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Body style={{ backgroundColor: 'var(--color3)' }}>
                <h1 style={{ color: 'white', width: '100%', fontWeight: 500, textAlign: 'left' }}>{title}</h1>

                <img src={image} alt='modal' />
                <h1 style={{
                    width: '100%', color: 'white', fontSize: '25px', marginBottom: '5px',
                }}>{subtitle}</h1>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: '20px' }}>
                    <button className='ButtonModal' onClick={() => {
                        setShow(false)
                    }}>{defaultNo}</button>
                    <button className='ButtonModal' onClick={confirmFunction}>{defaultYes}</button>
                </div>
            </Modal.Body>
        </Modal>


    );
}

export default ModalYesNo;
