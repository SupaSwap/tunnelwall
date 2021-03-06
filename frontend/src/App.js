/*  
project:
  - title: "Tunnelwall"
    repo: https://github.com/jshstw/tunnelwall
    license: "MIT"
author: 
  - name: "Josh Stow"
    url: https://github.com/jshstw
    email: "dev@tunnelwall.com"
*/

// import dependencies
import React, {
  useState,
  useRef
} from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { 
  Navbar,
  Jumbotron,
  Card,
  Form,
  FormGroup,
  InputGroup,
  Button,
  Container,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Spinner,
  Alert
} from 'react-bootstrap';
import { ReactComponent as Logo } from './icons/logo.svg';
import { ReactComponent as GithubIcon } from './icons/github.svg';
import { ReactComponent as CopyIcon } from './icons/copy.svg';
import OutputBox from './OutputBox';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider
const contractAddress = '0x58d9984CE91802580e31A70854375Bc2be2B73A9'; // goerli contract address
const contract = new web3.eth.Contract(tunnelwallAbi, contractAddress);

function App() {
  // react hooks
  const [post, setPost] = useState(['The tunnel begins here.', '0x88c055b85751448f3013378544ad463b2542f099', '02/03/2021, 15:06:56 (UTC)']);
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

    if (!readableMessage) {
      readableMessage = '???';
    }

    var message = web3.utils.fromAscii(formDataObj['messageInput'].padEnd(32, String.fromCharCode(0)));
    message = message.substring(0,66);

    try {
      var accounts = await window.ethereum.enable();
      var account = accounts[0];
      setWalletAddress('Connected: ' + account);
      setWriteError(false);

      //var gas = await contract.methods.write(message).estimateGas();
      var gas = 150000;
      var result = await contract.methods.write(message).send({ from: account, gas });

      setInfo('Your message has been posted');
      setPost([
        readableMessage,
        account,
        new Date(parseInt(result.events.Log.returnValues['timestamp']) * 1000).toLocaleString() + ' (UTC)']);
      setUid(result.events.Log.returnValues['uid']);
  
    } catch {
      setReadError(false);
      setWriteError(true);
    }
    
    e.target.reset();
    setWriteLoading(false);
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
        new Date(parseInt(rawResult[2]) * 1000).toLocaleString() + ' (UTC)'
      ]

      if (!result[0]) {
        result[0] = '???';
      }

      var _uid = await contract.methods.getUid().call();
      
      setUid(_uid);
      setInfo('Retrieved latest message');
      setPost(result);

    } catch {
      setWriteError(false);
      setReadError(true);
    }

    setMostRecentLoading(false);
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
          new Date(parseInt(rawResult[2]) * 1000).toLocaleString() + ' (UTC)'
        ]

        if (!result[0]) {
          result[0] = '???';
        }

        setUid(_uid);
        setInfo('Retrieved message with ID ' + _uid);
        setPost(result);

      } else {
        setUid('???');
        setInfo('No messages found at that ID');
        setPost(['???', '???', '???']);
      }

    } catch {
      setWriteError(false);
      setReadError(true);
    }

    e.target.reset()
    setSpecificLoading(false);
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
        new Date(parseInt(rawResult[2]) * 1000).toLocaleString() + ' (UTC)'
      ]

      if (!result[0]) {
        result[0] = '???';
      }

      setUid(_uid);
      setInfo('Retrieved random message');
      setPost(result);

    } catch {
      setWriteError(false);
      setReadError(true);
    }

    setRandomLoading(false);
  }

  function copyAddress(address) {
    navigator.clipboard.writeText(address);
  }

  // render
  return (
    <>
      <Navbar bg="dark" variant="dark">
        <Container fluid>
          <Navbar.Brand style={{
            paddingBottom: "0"
          }}>
            <Logo style={{
              width: "1.25em",
              height: "1.25em",
              marginBottom: "0.25em",
              marginRight: "0.5em"
            }}/>
            Tunnelwall 
          </Navbar.Brand>
          <span className="navbar-text text-right pr-2">
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
        A virtual wall built on the Ethereum blockchain, on which anyone can write to and read from
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
        <p className="text-center lead mb-5 pb-3">
          From here, you can interact with the Tunnelwall program. For help getting started, please view the 
          <Button 
            onClick={ executeScroll } 
            id="guideButton"
            style={{
              marginBottom: "0.2em",
              marginLeft: "0.35rem",
              fontSize: "1.25rem",
              fontWeight: "300",
              background: "none",
              border: "none",
              outline: "none",
              boxShadow: "none",
              padding: "0",
              color: "#007bff"
            }} >
            guide
          </Button>
          .
        </p>
        <Alert variant="warning" className="text-center mx-3 mb-5">
          This site is currently connected to the Goerli testnet. Collect some test Ether from the
          {' '}<a href="https://goerli-faucet.slock.it/" target="blank" style={{color: "#856404", fontWeight: "bold"}}>faucet</a>
        .
        </Alert>
        <Row className="mb-5 pb-3 w-100 mx-0" >
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
            <OutputBox
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
          and serves as a pseudo-anonymous message board stored on the <a href="https://ethereum.org/en/" target="blank">Ethereum network</a>.
          Anyone in the world can write on the wall, and equally read from it. The wall has no censorship,
          as when a message is written, it remains there on the blockchain for eternity.
        </p>
        <h3 className="text-center text-dark pt-4 mb-4" ref={ guideRef }>Getting started</h3>
        <p className="lead text-center">
          If you already have MetaMask set up, just switch to the Goerli testnet, and then there's
          nothing more you need to do and the Tunnelwall is yours to explore! If not, please keep reading.
        </p>
        <p className="lead text-center">
          Visit the <a href="https://metamask.io/download.html" target="blank">MetaMask</a> website,
          and download the extension for your current browser. Start
          MetaMask, then read and accept the terms & conditions.
          Enter a secure password and create your wallet. Make sure you create a copy of your seed
          phrase and keep it somewhere safe ??? it's the only way to restore your wallet if something
          bad happens!
        </p>
        {/*
        <p className="lead text-center">
          Writing a message on the wall requires you to pay a small transaction fee in the form 
          of <a href="https://support.blockchain.com/hc/en-us/articles/360027772571-What-is-gas-" target="blank">gas</a>. 
          This fee is paid in Ether and varies depending on how busy the network is at the time.
          To top up your MetaMask wallet with Ether, either buy some using currency on exchanges
          like <a href="https://www.coinbase.com" target="blank">Coinbase</a> or <a href="https://www.binance.com/en" target="blank">Binance</a> and
          transfer it, or send it from an Ethereum wallet you own which
          already contains some Ether.
        </p>
        */}
        <p className="lead text-center">
          Writing a message on the wall requires you to pay a small transaction fee in the form 
          of <a href="https://support.blockchain.com/hc/en-us/articles/360027772571-What-is-gas-" target="blank">gas</a>. 
          As the Tunnelwall is currently deployed on the Goerli testnet, this fee is paid in test Ether and varies
          depending on how busy the network is at the time.
          To top up your MetaMask wallet with Goerli test Ether, you can collect some for free from
          the <a href="https://goerli-faucet.slock.it" target="blank">faucet</a>.
        </p>
        <p className="lead text-center pb-5">
          When reading messages from the wall, you will not need to pay any transaction fees, but you
          will need to be connected with the MetaMask extension, with the Goerli test network selected, in
          order to communicate with the blockchain.
        </p>
        <h3 className="text-center text-dark pt-4 pb-4">Please consider donating</h3>
        <p className="lead text-center pb-2">
          Donations of any size are greatly appreciated, and help to keep this site up and running.
          Any Ether sent to the address below will go directly to the author of this project ??? thank you.
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
                value="0xbB61A5398EeF5707fa662F42B7fC1Ca32e76e747"
                readonly />
              <InputGroup.Append>
                <OverlayTrigger
                  overlay={<Tooltip>Copy to clipboard</Tooltip>}
                  placement="right" >
                  <Button onClick={ () => copyAddress("0xbB61A5398EeF5707fa662F42B7fC1Ca32e76e747") }>
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
        <span className="navbar-text my-0 ml-auto pr-2">
          MIT ?? 2021
          {' '}
          <a
            style={{
              color: "rgba(255, 255, 255, 0.5)"
            }}
            href="https://github.com/jshstw"
            target="blank" >
            Josh Stow
          </a>
        </span>
      </Navbar>
    </>
  );
}

export default App;