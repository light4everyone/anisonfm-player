import React from 'react';
import { AuthProvider } from './lib/auth';
import { Login } from './pages/Login';
import { Player } from './player/Player';


const App = () => {
  return (
    <Player></Player>
    // <AuthProvider>
    //   <Login></Login>
    // </AuthProvider>
  )
}

export default App;
