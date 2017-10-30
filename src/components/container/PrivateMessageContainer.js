import React, { Component } from 'react';
import PrivateMessaging from '../PrivateMessaging';
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export default class PrivateMessagingContainer extends Component {
  constructor() {
    super();

    this.state = {
      privateMessageInput: "",
      privateMessageLog: []
    }
  }

  handlePrivateInput = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handlePrivateSubmit = (e) => {
    e.preventDefault();

    this.sendPrivateMessage();
  }

  sendPrivateMessage = () => {
    const privateMessageInput = this.state.privateMessageInput;
    const recipientId = this.props.currentPrivateRecipient._id;

    axios.post(`${API_URL}/chat/reply`, { privateMessageInput, recipientId }, {
      headers: { Authorization: this.props.token }
    })
    .then(res => {
      console.log(res);
    })
    .catch(err => {
      console.log(err);
    })
  }

  getPrivateMessages = () => {
    const currentPrivateRecipient = this.props.currentPrivateRecipient;

    axios.get(`${API_URL}/chat/privatemessages/${currentPrivateRecipient._id}`, {
      headers: { Authorization: this.props.token }
    })
    .then(res => {
      console.log(res)
      const updatedMessageLogs = Array.from(this.state.privateMessageLog);

      updatedMessageLogs.push(res.data.conversation);

      this.setState({
        privateMessageLog: updatedMessageLogs
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  componentDidMount() {
    this.getPrivateMessages();
  }

  render() {
    return (
      <div>
        <PrivateMessaging
          handlePrivateInput={this.handlePrivateInput} 
          handlePrivateSubmit={this.handlePrivateSubmit}
          {...this.props}
          {...this.state}
        />
      </div>
    )
  }
}