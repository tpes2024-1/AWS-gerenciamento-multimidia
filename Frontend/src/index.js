import 'bootstrap/dist/css/bootstrap.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Login from './views/login/Login';
import reportWebVitals from './reportWebVitals';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Register from './views/register/Register';
import DashBoard from './views/dashBoard/DashBoard';
import MediaManager from './components/MediaManager/MediaManager';
// import GerenciarFotos from './views/gerenciarFotos/GerenciarFotos'
// import VerificandoEmail from './views/verificandoEmail/VerificandoEmail';
// import Profile from './views/profile/Profile';
// import PesquisarUsers from './views/pesquisarUsers/PesquisarUsers';
const router = createBrowserRouter([
  {
    path: "/",
    Component: Login
  },
  {
    path: "/register",
    Component: Register
  },

  {
    path: "/home",
    Component: DashBoard
  },
  {
    path: "/mediaManager",
    Component: MediaManager
  },
  // {
  //   path: "/confirm-account/:email/:token",
  //   Component: VerificandoEmail,
  // },
  // {
  //   path: "/profile/:id",
  //   Component: Profile,
  // },
  // {
  //   path: "/search/users",
  //   Component: PesquisarUsers,
  // }
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);

reportWebVitals();
