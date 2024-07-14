import './Login.css';
import LoginSVG from "../../assets/imgs/login.svg"
import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validators from '../Validators';
import instance from '../../api';

function Login() {
  const navigate = useNavigate()
  // "variaveis"
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // erros
  const [emailError, setEmailError] = useState(false);
  const [senhaError, setSenhaError] = useState(false);
  const [userInvalid, setUserInvalid] = useState(false)
  const [esperandoConfirmError, setEsperandoConfirmError] = useState(false)

  useEffect(() => {
    Validators.isNoAuth(navigate)
  })
  const onSubmit = (event) => {
    event.preventDefault();

    setEmailError(email === "" ? true : false)
    setSenhaError(senha === "" || !Validators.isValidPassword(senha) ? true : false)

    if (senha !== "" && email !== "" && Validators.isValidPassword(senha)) {


      instance.post('/login', {
        username: email,
        password: senha
      },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded"
          }
        })
        .then(function (response) {

          if (response.status === 200) {
            instance.get('users/me', {
              headers: {
                'Authorization': 'Bearer ' + response.data['access_token']
              }
            }).then((responseProfile) => {
              if (responseProfile.status === 200) {
                setEsperandoConfirmError(false)
                setUserInvalid(false)

                localStorage.setItem('avatar', responseProfile.data['profile_image'])
                localStorage.setItem('username', responseProfile.data['username'])
                console.log(response.data['access_token'])
                localStorage.setItem('token', response.data['access_token'])
                localStorage.setItem('token_type', response.data['token_type'])

                navigate("/home")
              }
            })



          }
        })
        .catch(function (error) {
          if (error.response.data['detail'] === "Usuário não encontrado") {
            setUserInvalid(true)
          }
        });
    }
  }

  return (
    <div className="Container">

      <form onSubmit={onSubmit} className='Form'>
        <div style={{ display: 'block' }}>
          <h3 className='AppName'>SafeStore</h3>
          <label htmlFor='email' className='LabelPadrao' style={{ color: emailError ? '#FF2E2E' : 'white' }} >username</label>
          <input id='email' className='InputPadrao' style={{ border: emailError ? '#FF2E2E 2px solid' : 'white 2px solid', background: emailError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} typeof='text' value={email} onChange={(event) => {
            setEmail(event.target.value);
          }} />
          <label htmlFor='password' className='LabelPadrao' style={{ color: senhaError ? '#FF2E2E' : 'white' }} >senha</label>

          <input id='password' className='InputPadrao' style={{ marginBottom: userInvalid ? 5 : 15, border: senhaError ? '#FF2E2E 2px solid' : 'white 2px solid', background: senhaError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} type='password' value={senha} onChange={(event) => {
            setSenha(event.target.value);
          }} />

          <label className='LabelPadrao' style={{ color: userInvalid ? '#FF2E2E' : 'white', display: userInvalid ? 'block' : 'none', margin: 'auto', marginBottom: 15 }} >username ou senha inválidos</label>

          <label className='LabelPadrao' style={{ color: esperandoConfirmError ? '#FF2E2E' : 'white', display: esperandoConfirmError ? 'block' : 'none', margin: 'auto', marginBottom: 15 }} >esperando confirmar o email</label>

          <button id='advance' type='submit' className='Button' >Avançar</button>

          <div className='ToRegistro'>
            não tem uma conta? <Link to="/register">Registre-se</Link>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;
