import React, { useState } from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { Navbar, Jumbotron, Card, Form, FormGroup, InputGroup, Button, Container, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ReactComponent as Logo } from './logo.svg';
import { ReactComponent as GithubLogo } from './github.svg';
import MessageCard from './MessageCard';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider
const contractAddress = '0xF472c0676b7b4eda7675f6301962BCa168EEBE2f'; // contract address from Truffle migration to Ganache
const contract = new web3.eth.Contract(tunnelwallAbi, contractAddress);

function App() {
  const [post, setPost] = useState(['The tunnel begins here.', '0x0000000000000000000000000000000000000000', 'Arbitrary timestamp']);
  const [uid, setUid] = useState(0);
  const [info, setInfo] = useState('Retrieved the genesis message')
  const [walletAddress, setWalletAddress] = useState('Please connect a wallet with MetaMask')

  const handleWriteMessage = async (e) => {
    e.preventDefault();

    var accounts = await window.ethereum.enable();
    var account = accounts[0];
    setWalletAddress('Connected: ' + account);

    const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries())
    var readableMessage = formDataObj['messageInput']
    var message = web3.utils.fromAscii(formDataObj['messageInput'].padEnd(32, String.fromCharCode(0)));

    var gas = await contract.methods.write(message).estimateGas();
    var result = await contract.methods.write(message).send({ from: account, gas });

    e.target.reset();

    setInfo('Your message has been posted');
    setPost([readableMessage, account, new Date(parseInt(result.events.Log.returnValues['timestamp']) * 1000).toLocaleString()]);
    setUid(result.events.Log.returnValues['uid']);

    console.log(result) // debugging
  }

  const handleGetLastMessage = async (e) => {
    e.preventDefault();

    var rawResult = await contract.methods.readLast().call();
    var result = [
      web3.utils.toAscii(rawResult[0]).replaceAll(String.fromCharCode(0),''),
      rawResult[1].toLowerCase(),
      new Date(parseInt(rawResult[2]) * 1000).toLocaleString()
    ]

    var _uid = await contract.methods.getUid().call();
    
    setUid(_uid);
    setInfo('Retrieved latest message on the wall');
    setPost(result);

    console.log(result) // debugging
  }

  const handleGetSpecificMessage = async (e) => {
    e.preventDefault();

    const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries())
    var _uid = formDataObj['uidInput']
    
    var rawResult = await contract.methods.read(web3.utils.toBN(parseInt(_uid))).call();

    if (parseInt(rawResult[2]) !== 0) {
      var result = [
        web3.utils.toAscii(rawResult[0]).replaceAll(String.fromCharCode(0),''),
        rawResult[1].toLowerCase(),
        new Date(parseInt(rawResult[2]) * 1000).toLocaleString()
      ]

      e.target.reset();

      setUid(_uid);
      setInfo('Retrieved message ' + _uid + ' from the wall');
      setPost(result);

    } else {
      e.target.reset();

      setUid('—');
      setInfo('No messages found at that ID');
      setPost(['—', '—', '—']);
    }

    console.log(result) // debugging
  }

  const handleGetRandomMessage = async (e) => {
    e.preventDefault();

    var _uid = await contract.methods.getUid().call();
    _uid = Math.floor(Math.random() * (parseInt(_uid) + 1));

    var rawResult = await contract.methods.read(web3.utils.toBN(_uid)).call();
    var result = [
      web3.utils.toAscii(rawResult[0]).replaceAll(String.fromCharCode(0),''),
      rawResult[1].toLowerCase(),
      new Date(parseInt(rawResult[2]) * 1000).toLocaleString()
    ]

    setUid(_uid);
    setInfo('Retrieved random message from the wall');
    setPost(result);

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
        className=" mb-5"
        style={{
          borderRadius: "0",
          backgroundImage: "linear-gradient(120deg, #b721ff 0%, #21d4fd 100%)",
          textAlign: "center"
        }}>
        <h1 className="text-white mt-5 pt-3">Welcome to the Tunnelwall Project</h1>
        <p className="text-white lead mb-4">
        A virtual wall built on the Ethereum blockchain, on which anyone can write to and read from.
        </p>
        <OverlayTrigger
          overlay={<Tooltip>View the code</Tooltip>}
          placement="bottom" >
          <a
            className="mb-5"
            href="https://www.github.com/jshstw/tunnelwall"
            target="blank"
            style={{
              position: "relative",
              display: "inline-block"
            }} >
            <GithubLogo
              style={{
                width: "2em",
                height: "2em",
                fill: "#fff"
              }} />
          </a>
        </OverlayTrigger>
      </Jumbotron>
      <Container>
        <h3 className="text-center text-dark pt-4">This is your dashboard</h3>
        <p className="text-center lead mb-5 pb-5">From here, you can interact with the Tunnelwall program. For help getting started, please view the <a href="https://www.google.com">guide</a>.</p>
        <Row className="mb-5">
          <Col xs={7}>
            <h5 className="text-center mb-2">Write a message on the wall</h5>
            <Card>
              <Card.Body>
                <Form
                  className="text-center"
                  onSubmit={ handleWriteMessage } >
                  <FormGroup>
                    <Form.Control
                      type="text"
                      maxLength="32"
                      name="messageInput"
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
              </Card.Body>
            </Card>
            <h5 className="text-center mt-4 mb-2">Read the messages on the wall</h5>
            <Card>
             <Card.Body>
              <Form
                onSubmit={ handleGetSpecificMessage } >
                <InputGroup className="mb-3">
                  <Form.Control
                    type="number"
                    min="0"
                    name="uidInput"
                    placeholder="Post ID" />
                  <InputGroup.Append>
                    <Button
                      className="px-5"
                      variant="primary"
                      type="submit" >
                      Read
                    </Button>
                  </InputGroup.Append>
                </InputGroup>
              </Form>
                <Row>
                  <Col xs={6}>
                    <Button
                      variant="primary"
                      type="button" 
                      onClick={ handleGetLastMessage }
                      block >
                      Most recent
                    </Button>
                  </Col>
                  <Col xs={6}>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={ handleGetRandomMessage }
                      block >
                      Random
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
          <Col xs={5}>
            <h5 className="text-center mb-2">Output</h5>
            <MessageCard
              info={ info }
              text={ post[0] }
              uid={ uid }
              address={ post[1] }
              timestamp={ post[2] } />
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
