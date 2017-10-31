import React, { Component } from 'react';
import PrivateMessaging from '../PrivateMessaging';
import axios from 'axios';
import io from 'socket.io-client';

const SOCKET_URL = "http://localhost:3000";
const socket = io(SOCKET_URL);
const API_URL = 'http://localhost:3000/api';

export default class PrivateMessagingContainer extends Component {
  constructor(props) {
    super(props);

    this.state = {
      privateMessageInput: "",
      privateMessageLog: [],
      conversationId: "",
      socketPMs: [],
      currentPrivateRecipient: this.props.currentPrivateRecipient,
      showTyping: false,
      activeUserTyping: ""
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
      const socketMsg = {
        body: privateMessageInput,
        conversationId: this.state.conversationId,
        author:[{
          item:{
            username: this.props.username
          }
        }]
      }
      socket.emit('new privateMessage', socketMsg);

      this.setState({
        privateMessageInput: ""
      })
    })
    .catch(err => {
      console.log(err);
    })
  }

  getPrivateMessages = () => {
    const currentPrivateRecipient = this.props.currentPrivateRecipient;
    const username = this.props.username


    axios.get(`${API_URL}/chat/privatemessages/${currentPrivateRecipient._id}`, {
      headers: { Authorization: this.props.token }
    })
    .then(res => {
      socket.emit('enter privateMessage', res.data.conversationId)

      this.setState({
        privateMessageLog: res.data.conversation,
        conversationId: res.data.conversationId
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  userTyping = (isTyping) => {
    const conversationId = this.state.conversationId;
    const username = this.props.username;
    const data = {
      isTyping,
      conversationId,
      username
    }
    socket.emit('user typing', data)
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      currentPrivateRecipient: nextProps.currentPrivateRecipient
    }, () => {
      this.getPrivateMessages()
    })
  }

  componentDidMount() {
    this.getPrivateMessages();

    socket.on('refresh privateMessages', (data) => {
      const updatedSocketPMs = Array.from(this.state.socketPMs);

      updatedSocketPMs.push(data);

      this.setState({
        socketPMs: updatedSocketPMs
      })
    });

    socket.on('typing', (data) => {
      console.log(data)
      this.setState({
        showTyping: data.isTyping,
        activeUserTyping: data.username
      });
    })

  }

  componentWillUnmount() {
    socket.emit('leave privateMessage', this.state.conversationId);
    socket.off('refresh privateMessages');
    socket.off('typing'); 
  }

  render() {
    return (
      <div>
        <PrivateMessaging
          handlePrivateInput={this.handlePrivateInput} 
          handlePrivateSubmit={this.handlePrivateSubmit}
          userTyping={this.userTyping}
          {...this.props}
          {...this.state}
        />
      </div>
    )
  }
}