import React from 'react';
import Routes from './routes';
import { BrowserRouter } from 'react-router-dom';
import AuthProvider from './Context/AuthProvider';
import AppProvider from './Context/AppProvider';
import AddRoomModal from './components/Modals/AddRoomModal';
import InviteMemberModal from './components/Modals/InviteMemberModal';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes />
          <AddRoomModal />
          <InviteMemberModal />
          <ToastContainer />
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>

  );
};



export default App;


