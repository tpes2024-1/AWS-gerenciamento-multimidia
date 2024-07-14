import './VerificandoEmail.css';

import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Spinner from 'react-bootstrap/Spinner';
import instance from '../../api'

function VerificandoEmail() {
  const { email, token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      instance.patch('sessions/confirm-account/', {
        email: email,
        token: token
      }).then((response) => {
        if (response.status === 200) {
          navigate('/')
        }
      })
    }, 500);


  })

  return (
    <div className="Container" style={{ display: 'block', textAlign: 'center', marginTop: 100 }}>
      <Spinner animation="grow" size='' style={{ width: 150, height: 150, color: 'white' }} color='#fff' />
      <h1 style={{ marginTop: 40, fontSize: 35 }} className='ValidandoTitle'>Validando Email...</h1>
      <h3 style={{ position: 'absolute', bottom: 10, width: '100%' }} className='AppName'>SafeStore</h3>
    </div>
  );
}

export default VerificandoEmail;
