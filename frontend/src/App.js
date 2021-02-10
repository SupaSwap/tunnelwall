import React from 'react';
import Web3 from 'web3';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider

function App() {
  return (
    <p>Welcome to the Tunnelwall</p>
  );
}

export default App;
