import React, { useState } from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { Navbar, Jumbotron, Form, FormGroup, Button, Alert, Container, Row, Col } from 'react-bootstrap';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as GithubLogo } from './github.svg';
import MessageCard from './MessageCard';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider
const contractAddress = '0x8b4216eCB98f7656b11089570Aa908A49A1b5F9d'; // contract address from Truffle migration to Ganache
const contract = new web3.eth.Contract(tunnelwallAbi, contractAddress);

function App() {
  const [message, setMessage] = useState('-');
  const [lastMessage, setLastMessage] = useState('');
  const [uid, setUid] = useState('-');
  const [walletAddress, setWalletAddress] = useState('Please connect a wallet with MetaMask')

  const handleWriteMessage = async (e) => {
    e.preventDefault();

    var accounts = await window.ethereum.enable();
    var account = accounts[0];
    setWalletAddress('Connected: ' + account);

    const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries())
    var message = formDataObj['input']
    var _message = web3.utils.fromAscii(formDataObj['input'].padEnd(32, String.fromCharCode(0)));

    var gas = await contract.methods.write(_message).estimateGas();
    var result = await contract.methods.write(_message).send({ from: account, gas });

    setMessage(message);
    setUid(result.events.Log.returnValues['uid']);

    console.log(result) // debugging
  }

  const handleGetLastMessage = async (e) => {
    e.preventDefault();

    var raw_result = await contract.methods.readLast().call();
    var result = [
      web3.utils.toAscii(raw_result[0]).replaceAll(String.fromCharCode(0),''),
      raw_result[1],
      new Date(parseInt(raw_result[2]) * 1000).toLocaleString()
    ]
    
    setLastMessage(result);

    console.log(result) // debugging
  }

  return (
    <div>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
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
          <span className="navbar-text mr-1">
          { walletAddress }
          </span>
        </Container>
      </Navbar>
      <Jumbotron 
        className="mb-5"
        style={{
          borderRadius: "0",
          backgroundImage: "linear-gradient(120deg, #b721ff 0%, #21d4fd 100%)",
          textAlign: "center"
        }}>
        <h1 className="text-white mt-5">Welcome to the Tunnelwall Project</h1>
        <p className="text-white lead mb-4">
        A virtual wall built on the Ethereum blockchain, on which anyone can write to and read from.
        </p>
        <a 
          href="https://www.github.com"
          target="blank"
          style={{
            position: "relative",
            display: "inline-block"
          }} >
          <GithubLogo 
            className="mb-4"
            style={{
              width: "2em",
              height: "2em",
              fill: "#fff"
            }} />
        </a>
      </Jumbotron>
      <Container>
        <h3 className="text-center text-dark">This is your dashboard</h3>
        <p className="text-center lead mb-5">From here, you can interact with the Tunnelwall program. For help getting started, please view the <a href="https://www.google.com">guide</a>.</p>
        <Row className="mb-4">
          <Col xs={7}>
            <Form
              className="text-center"
              onSubmit={ handleWriteMessage } >
              <FormGroup>
                <Form.Label>Write a message on the wall</Form.Label>
                <Form.Control
                  type="text"
                  maxLength="32"
                  name="input"
                  placeholder="Max 32 characters"
                  />
              </FormGroup>
              <Button
                variant="primary"
                type="submit"
                block >
                Write
              </Button>
            </Form>
          </Col>
          <Col xs={5}>
            <p className="text-center mb-2">Output</p>
            <MessageCard 
              text={ message }
              uid={ uid } />
          </Col>
        </Row>
        <Row>
          <Col xs={4}>
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
          </Col>
          <Col xs={4}>
            I am a column
          </Col>
          <Col xs={4}>
            I am also a column
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
