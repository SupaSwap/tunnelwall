import React from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { Form, FormGroup, Button } from 'react-bootstrap';
import { ReactComponent as Logo } from './logo.svg';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider

function App() {
  return (
    <div>
      <Logo />
      <p>Welcome to the Tunnelwall</p>
      <Form className="text-center mb-5">
        <FormGroup>
          <Form.Label>Write a message on the wall</Form.Label>
          <Form.Control type="text"/>
        </FormGroup>
        <Button
          variant="primary"
          type="submit"
          block >
          Write
        </Button>
      </Form>
    </div>
  );
}

export default App;
