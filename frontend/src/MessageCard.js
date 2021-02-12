import React, { Component } from 'react';
import { Card, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { ReactComponent as HelpIcon } from './help.svg';

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
            <OverlayTrigger
              overlay={<Tooltip>View on <strong>etherscan.io</strong></Tooltip>}
              placement="right" >
              <HelpIcon
                style={{
                  width: "1em",
                  height: "1em",
                  fill: "#292b2c",
                  marginBottom: "0.15em",
                  marginLeft: "0.3em"
                }} />
            </OverlayTrigger>
          </Card.Text>
          <hr className="my-3"/>
          <Card.Subtitle className="mt-3">Timestamp</Card.Subtitle>
          <Card.Text>{ this.props.timestamp }</Card.Text>
        </Card.Body>
      </Card>
    )
  }
}