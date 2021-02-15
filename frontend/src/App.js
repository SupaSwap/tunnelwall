import React, { useState, useRef } from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { Navbar, Jumbotron, Card, Form, FormGroup, InputGroup, Button, Container, Row, Col, OverlayTrigger, Tooltip, Spinner, Alert } from 'react-bootstrap';
import { ReactComponent as Logo } from './icons/logo.svg';
import { ReactComponent as GithubIcon } from './icons/github.svg';
import { ReactComponent as CopyIcon } from './icons/copy.svg';
import MessageCard from './MessageCard';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider
const contractAddress = '0x9A9199c61e134A260098572C51521d7E43cA4AdB'; // contract address from Truffle migration to Ganache
const contract = new web3.eth.Contract(tunnelwallAbi, contractAddress);

function App() {
  const [post, setPost] = useState(['The tunnel begins here.', '0x0000000000000000000000000000000000000000', 'Arbitrary timestamp']);
  const [uid, setUid] = useState(0);
  const [info, setInfo] = useState('Retrieved the genesis message');
  const [walletAddress, setWalletAddress] = useState('Please connect a wallet with MetaMask');

  const [writeLoading, setWriteLoading] = useState(false);
  const [specificLoading, setSpecificLoading] = useState(false);
  const [mostRecentLoading, setMostRecentLoading] = useState(false);
  const [randomLoading, setRandomLoading] = useState(false);

  const [writeError, setWriteError] = useState(false);
  const [readError, setReadError] = useState(false);

  const guideRef = useRef(null);
  const executeScroll = () => guideRef.current.scrollIntoView()

  const handleWriteMessage = async (e) => {
    e.preventDefault();

    setWriteLoading(true);
    
    const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries())
    var readableMessage = formDataObj['messageInput']
    var message = web3.utils.fromAscii(formDataObj['messageInput'].padEnd(32, String.fromCharCode(0)));
    message = message.substring(0,66);

    try {
      var accounts = await window.ethereum.enable();
      var account = accounts[0];
      setWalletAddress('Connected: ' + account);
      setWriteError(false);

      var gas = await contract.methods.write(message).estimateGas();
      var result = await contract.methods.write(message).send({ from: account, gas });

      setInfo('Your message has been posted');
      setPost([readableMessage, account, new Date(parseInt(result.events.Log.returnValues['timestamp']) * 1000).toLocaleString()]);
      setUid(result.events.Log.returnValues['uid']);
  
    } catch {
      console.log('No wallet') // debugging

      setReadError(false);
      setWriteError(true);
    }
    
    e.target.reset();

    setWriteLoading(false);
  
    console.log(result) // debugging
  }

  const handleGetLastMessage = async (e) => {
    e.preventDefault();
    
    setMostRecentLoading(true);

    try {
      var rawResult = await contract.methods.readLast().call();

      setWriteError(false);

      var result = [
        web3.utils.toAscii(rawResult[0]).replaceAll(String.fromCharCode(0),''),
        rawResult[1].toLowerCase(),
        new Date(parseInt(rawResult[2]) * 1000).toLocaleString()
      ]

      if (!result[0]) {
        result[0] = '—';
      }

      var _uid = await contract.methods.getUid().call();
      
      setUid(_uid);
      setInfo('Retrieved latest message');
      setPost(result);

    } catch {
      console.log('No wallet') // debugging

      setWriteError(false);
      setReadError(true);
    }

    setMostRecentLoading(false);
  
    console.log(result) // debugging
  }

  const handleGetSpecificMessage = async (e) => {
    e.preventDefault();

    setSpecificLoading(true);

    const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries())
    var _uid = parseInt(formDataObj['uidInput'])

    try {
      var _uidBN = web3.utils.toBN(_uid)

    } catch {
      e.target.reset();

      setSpecificLoading(false);
      
      return;
    }
    
    try {
      var rawResult = await contract.methods.read(_uidBN).call();

      setReadError(false);

      if (parseInt(rawResult[2]) !== 0) {
        var result = [
          web3.utils.toAscii(rawResult[0]).replaceAll(String.fromCharCode(0),''),
          rawResult[1].toLowerCase(),
          new Date(parseInt(rawResult[2]) * 1000).toLocaleString()
        ]

        if (!result[0]) {
          result[0] = '—';
        }

        setUid(_uid);
        setInfo('Retrieved message with ID ' + _uid);
        setPost(result);

      } else {
        setUid('—');
        setInfo('No messages found at that ID');
        setPost(['—', '—', '—']);
      }

    } catch {
      console.log('No wallet') // debuggin

      setWriteError(false);
      setReadError(true);
    }

    e.target.reset()

    setSpecificLoading(false);

    console.log(result) // debugging
  }

  const handleGetRandomMessage = async (e) => {
    e.preventDefault();

    setRandomLoading(true);

    try {
      var _uid = await contract.methods.getUid().call();

      setReadError(false);

      _uid = Math.floor(Math.random() * (parseInt(_uid) + 1));

      var rawResult = await contract.methods.read(web3.utils.toBN(_uid)).call();
      var result = [
        web3.utils.toAscii(rawResult[0]).replaceAll(String.fromCharCode(0),''),
        rawResult[1].toLowerCase(),
        new Date(parseInt(rawResult[2]) * 1000).toLocaleString()
      ]

      if (!result[0]) {
        result[0] = '—';
      }

      setUid(_uid);
      setInfo('Retrieved random message');
      setPost(result);

    } catch {
      console.log('No wallet') // debugging
      
      setWriteError(false);
      setReadError(true);
    }

    setRandomLoading(false);

    console.log(result) // debugging
  }

  function copyAddress(address) {
    navigator.clipboard.writeText(address);
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
          <span className="navbar-text pr-2">
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
            <GithubIcon
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
        <p className="text-center lead mb-5 pb-5">
          From here, you can interact with the Tunnelwall program. For help getting started, please view the 
          <Button 
            onClick={ executeScroll } 
            style={{
              marginBottom: "0.34em",
              marginLeft: "0.34em",
              fontSize: "1.25rem",
              fontWeight: "300",
              background: "none",
              border: "none",
              outline: "none",
              boxShadow: "none",
              padding: "0",
              color: "#007bff",
              textDecoration: "underline"
            }} >
            guide
          </Button>
          .
        </p>
        <Row className="mb-5 pb-3 w-100" >
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
                      placeholder="Max 32 ASCII characters"
                      />
                    <Form.Text className="text-muted text-left">
                      Note: Writing on the wall requires you to pay gas fees on the Ethereum network
                    </Form.Text>
                  </FormGroup>
                  <Button
                    variant="primary"
                    type="submit"
                    block >
                    { !writeLoading && (
                        <p className="mb-0">Write</p>
                    )}
                  { writeLoading && (
                    <Spinner
                      style={{
                        marginBottom: "0.1em"
                      }}
                      as="span"
                      animation="border"
                      size="sm"
                      role="status" />
                  )}
                  </Button>
                  { writeError && (
                    <Alert
                      onClose={ () => setWriteError(false) }
                      dismissible
                      variant="danger"
                      className="mb-0 mt-3" >
                      Please connect with a MetaMask wallet
                    </Alert>
                  )}
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
                      placeholder="Enter post ID" />
                    <InputGroup.Append>
                      <Button
                        className="px-5"
                        variant="primary"
                        type="submit" >
                        { !specificLoading && (
                          <p className="mb-0">Read</p>
                        )}
                      { specificLoading && (
                        <Spinner
                          style={{
                            marginBottom: "0.1em",
                            marginLeft: "0.6em",
                            marginRight: "0.6em"
                          }}
                          as="span"
                          animation="border"
                          size="sm"
                          role="status" />
                      )}
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
                      { !mostRecentLoading && (
                        <p className="mb-0">Most recent</p>
                      )}
                    { mostRecentLoading && (
                      <Spinner
                        style={{
                          marginBottom: "0.1em"
                        }}
                        as="span"
                        animation="border"
                        size="sm"
                        role="status" />
                    )}
                    </Button>
                  </Col>
                  <Col xs={6}>
                    <Button
                      variant="primary"
                      type="button"
                      onClick={ handleGetRandomMessage }
                      block >
                      { !randomLoading && (
                        <p className="mb-0">Random</p>
                      )}
                    { randomLoading && (
                      <Spinner
                        style={{
                          marginBottom: "0.1em"
                        }}
                        as="span"
                        animation="border"
                        size="sm"
                        role="status" />
                    )}
                    </Button>
                  </Col>
                </Row>
                { readError && (
                  <Alert
                    onClose={ () => setReadError(false) }
                    dismissible
                    variant="danger"
                    className="text-center mb-0 mt-3" >
                    Please connect with a MetaMask wallet
                  </Alert>
                )}
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
        <h3 className="text-center text-dark pt-4 pb-4">What is Tunnelwall?</h3>
        <p className="lead text-center pb-5">
          Tunnelwall is a project developed by <a href="https://github.com/jshstw/" target="blank">Josh Stow</a>,
          which acts as a virtual 'wall' stored on the <a href="https://ethereum.org/en/" target="blank">Ethereum network</a>.
          Anyone in the world can write on the wall, and equally read from it. The wall has no censorship,
          as when a message is written, it remains there on the blockchain for eternity.
        </p>
        <h3 className="text-center text-dark pt-4 mb-4" ref={ guideRef }>Getting started</h3>
        <p className="lead text-center">
          If you already have MetaMask set up, you're already done and the Tunnelwall is yours to explore! If not, please keep reading...
        </p>
        <p className="lead text-center">
          Visit the <a href="https://metamask.io/download.html" target="blank">MetaMask</a> website,
          and download the extension for your current browser. Start
          MetaMask, then read and accept the terms & conditions.
          Enter a secure password and create your wallet. Make sure you create a copy of your seed
          phrase and keep it somewhere safe — it's the only way to restore your wallet if something
          bad happens!
        </p>
        <p className="lead text-center">
          Writing a message on the wall requires you to pay a small transaction fee in the form 
          of <a href="https://support.blockchain.com/hc/en-us/articles/360027772571-What-is-gas-" target="blank">gas</a>. 
          This fee is paid in Ether and varies depending on how busy the network is at the time.
          To top up your MetaMask wallet with Ether, either buy some using currency on exchanges
          like <a href="https://www.coinbase.com" target="blank">Coinbase</a> or <a href="https://www.binance.com/en" target="blank">Binance</a> and
          transfer it, or send it from an Ethereum wallet you own which
          already contains some Ether.
        </p>
        <p className="lead text-center pb-5">
          When reading messages from the wall, you will not need to pay any transaction fees, but you
          will need to be connected with the MetaMask extension in order to communicate with the
          blockchain.
        </p>
        <h3 className="text-center text-dark pt-4 pb-4">Please consider donating</h3>
        <p className="lead text-center pb-2">
          Donations of any size are greatly appreciated, and help to keep this site up and running.
          Any Ether sent to the address below will go directly to the author of this project — thank you.
        </p>
        <Row>
          <Col />
          <Col xs={6}>
            <InputGroup className="mb-3">
              <Form.Control
                style={{
                  boxShadow: "none",
                  borderColor: "rgba(0, 0, 0, 0.125)"
                }}
                className="text-center"
                type="text"
                value="0x0000000000000000000000000000000000000000"
                readonly />
              <InputGroup.Append>
                <OverlayTrigger
                  overlay={<Tooltip>Copy to clipboard</Tooltip>}
                  placement="right" >
                  <Button onClick={ () => copyAddress("0x0000000000000000000000000000000000000000") }>
                    <CopyIcon 
                      style={{
                        marginBottom: "0.1em",
                        width: "1.2em",
                        height: "1.2em",
                        fill: "#fff"
                      }} />
                  </Button>
                </OverlayTrigger>
              </InputGroup.Append>
            </InputGroup>
          </Col>
          <Col />
        </Row>
      </Container>
      <Navbar
        style={{
          marginTop: "8em"
        }}
        bg="dark"
        variant="dark" >
        <a
          className="navbar-text my-0 mr-auto pl-2"
          href="mailto:dev@tunnelwall.com" >
          dev@tunnelwall.com
        </a>
        <a
          className="navbar-text my-0 ml-auto pr-2"
          href="https://github.com/jshstw"
          target="blank" >
          Josh Stow 2021
        </a>
      </Navbar>
    </div>
  );
}

export default App;
