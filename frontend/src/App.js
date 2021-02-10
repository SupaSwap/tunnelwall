import React, { useState } from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { Navbar, Form, FormGroup, Button, Alert } from 'react-bootstrap';
import { ReactComponent as Logo } from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider
const contractAddress = '0xd159ac415F41B06ca2420aAC9264654a239def51'; // contract address from Truffle migration to Ganache
const contract = new web3.eth.Contract(tunnelwallAbi, contractAddress);

function App() {
  const [lastMessage, setLastMessage] = useState('');

  const handleGetLastMessage = async (e) => {
    e.preventDefault();
    var raw_result = await contract.methods.readLast().call();
    var result = [
      web3.utils.toAscii(raw_result[0]).replaceAll(String.fromCharCode(0),''),
      raw_result[1],
      new Date(parseInt(raw_result[2]) * 1000).toLocaleString()
    ]
    console.log(result) // debugging
    setLastMessage(result);
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand style={{
          paddingBottom: "0"
        }}>
          <Logo style={{
            width: "1.5em",
            height: "1.5em",
            marginBottom: "0.3em"
          }}/>{' '}
          Tunnelwall
        </Navbar.Brand>
      </Navbar>
      <Logo style={{
        display: "block",
        margin: "auto"
        }} />
      <h1 className="text-center">Welcome to the Tunnelwall Project</h1>
      <p className="lead text-center">
      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
      Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
      Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
      </p>
      <Form className="text-center mb-5">
        <FormGroup>
          <Form.Label>Write a message on the wall</Form.Label>
          <Form.Control
            type="text"
            maxLength="32" />
        </FormGroup>
        <Button
          variant="primary"
          type="submit"
          block >
          Write
        </Button>
      </Form>
      <p className="text-center mb-2">Get most recent message</p>
      <Button
        className="mb-3"
        variant="primary"
        type="button" 
        onClick={ handleGetLastMessage }
        block >
        Request Message
      </Button>
      <Alert variant="secondary" className="text-center py-2 px-3">{ lastMessage[0] }</Alert>
      <Alert variant="secondary" className="text-center py-2 px-3">{ lastMessage[1] }</Alert>
      <Alert variant="secondary" className="text-center py-2 px-3">{ lastMessage[2] }</Alert>
    </div>
  );
}

export default App;
