import React, { Component } from 'react';
import { Card } from 'react-bootstrap';

export default class MessageCard extends Component {
  render() {
    return(
      <Card className="w-100">
        <Card.Body>
          <Card.Title className="text-center">{ this.props.info }</Card.Title>
          <hr className="mt-4 mb-3"/>
          <Card.Subtitle className="mt-3">Post ID</Card.Subtitle>
          <Card.Text>{ this.props.uid }</Card.Text>
          <hr className="my-3"/>
          <Card.Subtitle className="mt-3">Text</Card.Subtitle>
          <Card.Text>{ this.props.text }</Card.Text>
          <hr className="my-3"/>
          <Card.Subtitle className="mt-3">Sender Address</Card.Subtitle>
          <Card.Text>
            <a 
              href={"https://etherscan.io/address/" + this.props.address }
              target="blank" >{ this.props.address }
            </a>
          </Card.Text>
          <hr className="my-3"/>
          <Card.Subtitle className="mt-3">Timestamp</Card.Subtitle>
          <Card.Text>{ this.props.timestamp }</Card.Text>
        </Card.Body>
      </Card>
    )
  }
}