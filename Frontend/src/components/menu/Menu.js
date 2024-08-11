import './Menu.css';
import Logout from '../../assets/imgs/logout.svg'
import Home from '../../assets/imgs/casa.svg'
import Image from '../../assets/imgs/image.svg'
import Lupa from '../../assets/imgs/lupa.svg'
import UserDefault from '../../assets/imgs/user.svg'

import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import config from '../../config'
import Validators from '../../views/Validators';
import ImageLogout from '../../assets/imgs/logoutImage.svg'
import Modal from 'react-bootstrap/Modal'
import instance from '../../api';

function Menu() {
  const navigate = useNavigate()
  const [imagem, setImage] = useState('')
  const [perfil, setPerfil] = useState('')
  const [logoutModal, setLogoutModal] = useState(false)

  const getData = () => {
    setPerfil(localStorage.getItem('username'))
    setImage( localStorage.getItem('avatar'))
    Validators.isAuth(navigate)
  }
  const logout = () => {

    navigate('/')
    instance.post('logout', {}, {
      headers: {
        'Authorization': 'Bearer ' + localStorage.getItem('token')
      }
    }).then((response) => {
      if (response.data.message === 'Logout realizado com sucesso') {
        localStorage.removeItem('avatar')
        localStorage.removeItem('username')
        localStorage.removeItem('token')
        localStorage.removeItem('user_id')
        navigate('/')
      }

    })
  }
  const returnBackground = () => {
    var part1 = "url("
    var part2 = localStorage.getItem('avatar') === "null" ? UserDefault : imagem
    var part3 = ")  center/cover"
    return part1 + part2 + part3
  }

  useEffect(() => {
    getData()
  }, [])

  return (
    <>
      <div className="Menu">
        <span className='AppNameMenu'> <h1>SafeStore</h1> </span>
        <div style={{ background: returnBackground() }} className='ImagePerfilMenu'  >
        </div>
        <span className='PerfilMenu'>@{perfil}</span>
        <div className='ItensMenu'>
          <div onClick={() => {
            window.location.pathname === '/home' ? console.log('') : navigate('/home')
          }} className={window.location.pathname === '/home' ? 'ItemMenuActive' : 'ItemMenu'}>Home</div>
          <hr className='BarraMenu' />
          <div onClick={() => {
            window.location.pathname === '/mediaManager' ? console.log('') : navigate('/mediaManager')
          }} className={window.location.pathname === '/mediaManager ' ? 'ItemMenuActive' : 'ItemMenu'} >Gerenciar Mídias</div>
          <hr className='BarraMenu' />
          <div onClick={() => {
            window.location.pathname === '/profile/' + localStorage.getItem('user_id') ? console.log('') : navigate('/profile/' + localStorage.getItem('user_id'))
          }} className={window.location.pathname === '/profile/' + localStorage.getItem('user_id') ? 'ItemMenuActive' : 'ItemMenu'} >Profile</div>

          <hr className='BarraMenu' />

          <div onClick={() => {
            window.location.pathname === '/search/users' ? console.log('') : navigate('/search/users')
          }} className={window.location.pathname === '/search/users' ? 'ItemMenuActive' : 'ItemMenu'} >Procurar usuário</div>
        </div>
        <hr className='BarraMenu' />
        <div onClick={() => setLogoutModal(true)} className='LogoutMenu'>
          <img style={{ width: 30, height: 25 }} src={Logout} alt='logout' />          Logout
        </div>
      </div>
      <div className="MenuMobile">
        <div onClick={() => {
          window.location.pathname === '/home' ? console.log('') : navigate('/home')
        }} className='ItemMenuMobile'>
          <img style={{ width: 30, height: 25 }} src={Home} alt='Home' />
        </div>

        <div onClick={() => {
          window.location.pathname === '/photos' ? console.log('') : navigate('/photos')
        }} className='ItemMenuMobile'>
          <img style={{ width: 30, height: 25 }} src={Image} alt='Gerenciar Imagens' />
        </div>

        <div style={{ marginTop: -20 }} className='ItemMenuMobile'>
          <div onClick={() => {
            navigate('/profile/' + localStorage.getItem('user_id'))
          }} style={{ background: returnBackground(), width: 35, height: 35, border: 'solid 1px white' }} className='ImagePerfilMenu'  ></div>
        </div>

        <div onClick={() => {
          window.location.pathname === '/search/users' ? console.log('') : navigate('/search/users')
        }} className='ItemMenuMobile'>
          <img style={{ width: 30, height: 30 }} src={Lupa} alt='Procurar Usuário' />
        </div>

        <div onClick={() => setLogoutModal(true)} className='ItemMenuMobile'>
          <img style={{ width: 30, height: 25 }} src={Logout} alt='logout' />
        </div>

      </div>
      <Modal show={logoutModal} onHide={() => setLogoutModal(false)} >
        <Modal.Body style={{ backgroundColor: 'var(--color3)', borderRadius:13 }}>
          <h1 style={{ color: 'white', width: '100%', fontWeight: 500, textAlign: 'left' }}>Logout</h1>

          <img alt='logout' src={ImageLogout} style={{ width: '85%', margin: '0px auto', textAlign: 'center' }} />
          <h1 style={{
            color: 'white', fontSize: '25px', width: '100%', marginBottom: '5px',
          }}>Tem certeza que deseja sair?</h1>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-around', marginTop: '20px' }}>
            <button style={{width:80}} className='ButtonPhoto' onClick={() => logout()}>Sim</button>
            <button style={{width:80}} className='ButtonPhoto' onClick={() => setLogoutModal(false)}>Não</button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
}

export default Menu;
