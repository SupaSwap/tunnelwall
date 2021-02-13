import React, { useState, useRef } from 'react';
import Web3 from 'web3';
import { tunnelwallAbi } from './abi';
import { Navbar, Jumbotron, Card, Form, FormGroup, InputGroup, Button, Container, Row, Col, OverlayTrigger, Tooltip, Spinner } from 'react-bootstrap';
import { ReactComponent as Logo } from './icons/logo.svg';
import { ReactComponent as GithubIcon } from './icons/github.svg';
import { ReactComponent as CopyIcon } from './icons/copy.svg';
import MessageCard from './MessageCard';
import 'bootstrap/dist/css/bootstrap.css';
import './App.css';

const web3 = new Web3(Web3.givenProvider);  // use the given Provider or instantiate a new websocket provider
const contractAddress = '0xF89eFec1c66eE86F72E494aBD4A26c14b499e299'; // contract address from Truffle migration to Ganache
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

  const guideRef = useRef(null);
  const executeScroll = () => guideRef.current.scrollIntoView()

  const handleWriteMessage = async (e) => {
    e.preventDefault();

    setWriteLoading(true);
    
    const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries())
    var readableMessage = formDataObj['messageInput']
    var message = web3.utils.fromAscii(formDataObj['messageInput'].padEnd(32, String.fromCharCode(0)));

    try {
      var accounts = await window.ethereum.enable();
      var account = accounts[0];
      setWalletAddress('Connected: ' + account);

      var gas = await contract.methods.write(message).estimateGas();
      var result = await contract.methods.write(message).send({ from: account, gas });

      setInfo('Your message has been posted');
      setPost([readableMessage, account, new Date(parseInt(result.events.Log.returnValues['timestamp']) * 1000).toLocaleString()]);
      setUid(result.events.Log.returnValues['uid']);
  
      setWriteLoading(false);

    } catch (error) {
      console.log(2)
      setWriteLoading(false);
    }
    
    e.target.reset();

    console.log(result) // debugging
  }

  const handleGetLastMessage = async (e) => {
    e.preventDefault();
    
    setMostRecentLoading(true);

    var rawResult = await contract.methods.readLast().call();
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

    setMostRecentLoading(false);

    console.log(result) // debugging
  }

  const handleGetSpecificMessage = async (e) => {
    e.preventDefault();

    setSpecificLoading(true);

    const formData = new FormData(e.target), formDataObj = Object.fromEntries(formData.entries())
    var _uid = parseInt(formDataObj['uidInput'])
    
    try {
      var rawResult = await contract.methods.read(web3.utils.toBN(_uid)).call();
    } catch(error) {
      rawResult = ['', '', 0];
    }
    
    if (parseInt(rawResult[2]) !== 0) {
      var result = [
        web3.utils.toAscii(rawResult[0]).replaceAll(String.fromCharCode(0),''),
        rawResult[1].toLowerCase(),
        new Date(parseInt(rawResult[2]) * 1000).toLocaleString()
      ]

      if (!result[0]) {
        result[0] = '—';
      }

      e.target.reset();

      setUid(_uid);
      setInfo('Retrieved message with ID ' + _uid);
      setPost(result);

    } else {
      e.target.reset();

      setUid('—');
      setInfo('No messages found at that ID');
      setPost(['—', '—', '—']);
    }

    setSpecificLoading(false);

    console.log(result) // debugging
  }

  const handleGetRandomMessage = async (e) => {
    e.preventDefault();

    setRandomLoading(true);

    var _uid = await contract.methods.getUid().call();
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
                      placeholder="Max 32 characters"
                      />
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
        <h3 className="text-center text-dark pt-4 mb-4" ref={ guideRef }>Getting started</h3>
        <p className="lead text-center">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          Cras eget lacus leo. Aliquam porta tristique odio ut vestibulum.
          Duis lobortis ac elit sed congue. Etiam aliquet tincidunt libero eget convallis.
          Proin id urna gravida, porttitor dui id, bibendum elit.
          Praesent justo augue, rhoncus vel euismod vel, gravida in eros.
          Pellentesque vulputate aliquam ex, ac aliquet odio efficitur vel.
        </p>
        <p className="lead text-center pb-5">
          Duis varius felis massa, eget vestibulum leo rutrum a.
          Curabitur quis mattis mauris, et lobortis nisl.
          Suspendisse diam nisl, tristique vitae erat quis, mattis rhoncus ipsum.
          Proin egestas justo at massa fermentum tempor ut at leo.
          Nunc lobortis augue lorem, pulvinar ullamcorper nibh tempus convallis.
          Mauris ex lacus, semper nec felis non, mollis fermentum massa.
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
          className="navbar-text my-0 ml-1"
          href="https://github.com/jshstw"
          target="blank" >
          © Josh Stow 2021
        </a>
      </Navbar>
    </div>
  );
}

export default App;
