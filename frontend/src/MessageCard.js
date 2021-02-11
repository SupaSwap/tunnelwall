import React, { Component } from 'react';
import { Card } from 'react-bootstrap';

export default class MessageCard extends Component {
  render() {
    return(
      <Card>
        <Card.Body>
          <Card.Title>{ this.props.text }</Card.Title>
          <Card.Subtitle className="text-muted">ID: { this.props.uid }</Card.Subtitle>
          <kbd> Hello</kbd>
        </Card.Body>
      </Card>
    )
  }
}