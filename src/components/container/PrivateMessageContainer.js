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
      currentPrivateRecipient: this.props.currentPrivateRecipient
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
      console.log(res)
      // const updatedMessageLogs = Array.from(this.state.privateMessageLog);

      // updatedMessageLogs.push(res.data.conversation);

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

  componentWillReceiveProps(nextProps) {
    console.log("receivedprops", nextProps)
    // this.getPrivateMessages();
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
    })
  }

  componentWillUnmount() {
    socket.emit('leave privateMessage', this.state.conversationId);
    socket.off('refresh privateMessages'); 
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