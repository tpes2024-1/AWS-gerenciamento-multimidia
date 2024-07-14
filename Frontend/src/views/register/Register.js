import './Register.css';
import RegisterSVG from "../../assets/imgs/register.svg"
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Validators from '../Validators';
import instance from '../../api';

function Register() {
  const navigate = useNavigate();

  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [confirm_senha, setConfSenha] = useState('');
  const [username, setUsername] = useState('');
  const [image, setImage] = useState({
    file: null,
  })


  const [nomeError, setNomeError] = useState(false);
  const [sobreNomeError, setsobreNomeError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [senhaError, setSenhaError] = useState(false);
  const [usernameError, setUsernameError] = useState(false);
  const [confirmSenhaError, setConfirmSenhaError] = useState(false);
  const [imageError, setImageError] = useState(false)
  const [cadastradoError, setCadastradoError] = useState(false)


  const onSubmit = (event) => {
    event.preventDefault();
    setNomeError(nome === "" ? true : false)
    setUsernameError(username === "" ? true : false)
    setsobreNomeError(sobrenome === "" ? true : false)
    setEmailError(email === "" || !Validators.isEmail(email) ? true : false)
    setSenhaError(senha === "" || (senha !== confirm_senha) || !Validators.isValidPassword(senha) ? true : false)
    setConfirmSenhaError(confirm_senha === "" || (senha !== confirm_senha) || !Validators.isValidPassword(confirm_senha) ? true : false)
    setCadastradoError(false)
    setImageError(image.file === null ? true : false)



    if (image.file !== "" && username !== "" && nome !== "" && sobrenome !== "" && email !== "" && senha !== "" && confirm_senha !== "" && (senha === confirm_senha) && Validators.isEmail(email) && Validators.isValidPassword(senha) && Validators.isValidPassword(confirm_senha)) {
      const form = new FormData();
      form.append('profile_image', image.fileReal);
      form.append('username', username);
      form.append('email', email);
      form.append('full_name', nome + sobrenome);
      form.append('password', senha);

      instance.post('/register', form,
        {
          headers: { 'Content-Type': 'multipart/form-data'}
        }).then(function (response) {
          console.log(response.data)
          if(response.status === 200) navigate('/')
        })
        .catch(function (error) {
          if (error.response.data['detail'] === "Nome de usuário já registrado") {
            setCadastradoError(true)
          }
        }).finally(() => {

        });
    }
  }

  useEffect(() => {
    Validators.isNoAuth(navigate)
  })

  return (
    <div className="Container">
      <div className="Image">
        <div className='ContainerImage'>
          <h1 className="Tittle">Registre-se agora para aproveitar todos os benefícios.</h1>
          <img src={RegisterSVG} alt="" />
        </div>

      </div>
      <form onSubmit={onSubmit} action='off' className="FormRegis">
        <div style={{ display: 'inline-block', height: 'auto' }}>
          <h3 className='AppName'>SafeStore</h3>
          {/* Image input */}
          <div className='InputImageDiv'>
            <img alt='' src={image.file} style={{ width: 130, height: 130, background: 'white', borderRadius: '50%', }} accept="image/*" />
            <label htmlFor='imageInput' className='InputImage' style={{ color: imageError ? '#FF2E2E' : 'black' }} >Adicionar Imagem</label>
            <input accept="image/png,image/jpeg" id='imageInput' className='' style={{ display: 'none' }} type='file' onChange={(event) => {
              const file = event.target.files[0];
              const acceptedImageTypes = ['image/gif', 'image/jpeg', 'image/png'];
              if (!acceptedImageTypes.includes(file['type']) || !Validators.checkImageSize()) {
                setImageError(true);
                setImage({
                  fileReal: "",
                  file: ""
                })
                return;
              }
              setImageError(false);

              setImage({
                fileReal: event.target.files[0],
                file: URL.createObjectURL(event.target.files[0])
              })
            }} />
          </div>

          {/* Nome */}
          <label className='LabelPadrao' style={{ color: nomeError ? '#FF2E2E' : 'white' }} >nome</label>
          <input id='name' maxLength={256} className='InputPadrao' style={{ marginBottom: nomeError ? 5 : 15, border: nomeError ? '#FF2E2E 2px solid' : 'white 2px solid', background: nomeError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} type='text' value={nome} onChange={(event) => {
            setNome(event.target.value);
          }} />
          {/* Sobrenome */}
          <label className='LabelPadrao' style={{ color: sobreNomeError ? '#FF2E2E' : 'white' }} >sobrenome</label>
          <input id='lastName' maxLength={256} className='InputPadrao' style={{ marginBottom: sobreNomeError ? 5 : 15, border: sobreNomeError ? '#FF2E2E 2px solid' : 'white 2px solid', background: sobreNomeError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} type='text' value={sobrenome} onChange={(event) => {
            setSobrenome(event.target.value);
          }} />
          {/* Email */}
          <label className='LabelPadrao' style={{ color: emailError ? '#FF2E2E' : 'white' }} >email</label>
          <input id='email' maxLength={256} className='InputPadrao' style={{ marginBottom: emailError ? 5 : 15, border: emailError ? '#FF2E2E 2px solid' : 'white 2px solid', background: emailError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} typeof='text' value={email} onChange={(event) => {
            setEmail(event.target.value);
          }} />
          {/* Username */}
          <label className='LabelPadrao' style={{ color: usernameError ? '#FF2E2E' : 'white' }} >username</label>
          <input id='username' maxLength={256} className='InputPadrao' style={{ marginBottom: usernameError ? 5 : 15, border: usernameError ? '#FF2E2E 2px solid' : 'white 2px solid', background: usernameError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} typeof='text' value={username} onChange={(event) => {
            setUsername(event.target.value);
          }} />
          {/* Senha */}
          <label className='LabelPadrao' style={{ color: confirmSenhaError || senhaError ? '#FF2E2E' : 'white' }} >senha</label>
          <input id='password' maxLength={200} className='InputPadrao' style={{ marginBottom: confirmSenhaError || senhaError ? 5 : 15, border: confirmSenhaError || senhaError ? '#FF2E2E 2px solid' : 'white 2px solid', background: confirmSenhaError || senhaError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} type='password' value={senha} onChange={(event) => {
            setSenha(event.target.value);
          }} />
          {/* Confirmar Senha */}
          <label className='LabelPadrao' style={{ color: confirmSenhaError || senhaError ? '#FF2E2E' : 'white' }} >confirmar senha</label>
          <input id='confirmPassword' maxLength={200} className='InputPadrao' style={{ marginBottom: confirmSenhaError || senhaError ? 15 : 15, border: confirmSenhaError || senhaError ? '#FF2E2E 2px solid' : 'white 2px solid', background: confirmSenhaError || senhaError ? 'linear-gradient(0deg, rgba(255, 46, 46, 0.20) 0%, rgba(255, 46, 46, 0.20) 100%), #213435' : 'transparent' }} type='password' value={confirm_senha} onChange={(event) => {
            setConfSenha(event.target.value);
          }} />
          <label className='LabelPadrao' style={{ color: cadastradoError ? '#FF2E2E' : 'white', display: cadastradoError ? 'block' : 'none', margin: 'auto', marginBottom: 15 }} >email ou username já cadastrado</label>

          <button type='submit' id='advance' className='ButtonRegis'>Avançar</button>

        </div>
        <div className='ToRegistroRegis'>
          já tenho uma conta? <Link to='/'>Loge-se</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
