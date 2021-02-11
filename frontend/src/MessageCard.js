import React, { Component } from 'react';
import { Card } from 'react-bootstrap';

export default class MessageCard extends Component {
  render() {
    return(
      <Card className="w-100">
        <Card.Body>
          <Card.Title>Card Title</Card.Title>
          <Card.Subtitle className="text-muted">ID: { this.props.uid }</Card.Subtitle>
          <p>{ this.props.text }</p>
        </Card.Body>
      </Card>
    )
  }
}