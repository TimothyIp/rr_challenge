import React, { Component } from 'react';
import PropTypes from 'prop-types'
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

  // Makes a POST call with a private message and a recipient id to save a message.
  // On success, it emits to the server sockets, a socketMsg object containing what is sent to mongodb, so it can
  // send that information to the recipient if they are connected.
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

  // Takes the current private recipient and makes a POST call taking the recipient id.
  // On success, it joins the user into a socket room with the conversation id returned as the room name.
  // Takes the response from the backend and sets the state with the conversation logs.
  getPrivateMessages = () => {
    const currentPrivateRecipient = this.props.currentPrivateRecipient;

    axios.get(`${API_URL}/chat/privatemessages/${currentPrivateRecipient._id}`, {
      headers: { Authorization: this.props.token }
    })
    .then(res => {
      socket.emit('enter privateMessage', res.data.conversationId)
      this.setState({
        privateMessageLog: res.data.conversation || [],
        conversationId: res.data.conversationId
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  // Tells the socket when a user is current typing.
  // Sends the conversation id and username to display who is typing.
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

  // On different recipients, it will get new private messages.
  componentWillReceiveProps(nextProps) {
    this.setState({
      currentPrivateRecipient: nextProps.currentPrivateRecipient
    }, () => {
      this.getPrivateMessages()
    })
  }

  // On mount, it gets private messages, and adds socket listeners for new private messages.
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

      this.setState({
        showTyping: data.isTyping,
        activeUserTyping: data.username
      });
    })

  }

  // Removes socket listeners and tells sever sockets the user has left that private room.
  componentWillUnmount() {
    socket.emit('leave privateMessage', this.state.conversationId);
    socket.off('refresh privateMessages');
    socket.off('typing'); 
  }

  render() {
    const { closePM } = this.props;
    return (
      <div className="private__message--container" onClick={(e) => {closePM(e)}}>
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

PrivateMessagingContainer.propTypes = {
  privateMessageInput: PropTypes.string,
  privateMessageLog: PropTypes.array,
  conversationId: PropTypes.string,
  socketPMs: PropTypes.array,
  currentPrivateRecipient: PropTypes.object,
  showTyping: PropTypes.bool,
  activeUserTyping: PropTypes.string
}