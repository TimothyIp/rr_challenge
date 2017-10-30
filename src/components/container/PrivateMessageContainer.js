import React, { Component } from 'react';
import PrivateMessaging from '../PrivateMessaging';

const API_URL = 'http://localhost:3000/api'

export default class PrivateMessagingContainer extends Component {
  constructor() {
    super();

    this.state = {
      privateMessageInput: ""
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
    // axios.post(`${API_URL}/reply`, { privateMessageInput,  })
  }

  render() {
    return (
      <div>
        <PrivateMessaging
          handlePrivateInput={this.handlePrivateInput} 
          handlePrivateSubmit={this.handlePrivateSubmit}
          {...this.props}
        />
      </div>
    )
  }
}