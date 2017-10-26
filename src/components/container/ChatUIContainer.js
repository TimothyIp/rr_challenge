import React, { Component } from 'react';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import Cookies from 'universal-cookie';
import axios from 'axios';
import Navigation from '../Navigation';
import ChatBox from '../ChatBox';
import io from 'socket.io-client';


const API_URL = 'http://localhost:3000/api';
const cookies = new Cookies();
const token = cookies.get('token');
const tokenUser = cookies.get('user');
const SOCKET_URL = "http://localhost:3000";

export default class ChatUIContainer extends Component {
  constructor(){
    super();
    
    this.state = {
      username: "",
      id: "",
      loginError: [],
      registrationError: [],
      formsShown: false,
      formsMethod: "",
      socketId: "",
      composedMessage: "",
      currentChannel: "Public-Main",
      privateMessage: ""
    }
  }

  componentWillMount() {
    this.initSocket();
  }

  componentDidMount() {
    //get messages
    axios.get(`${API_URL}/chat`, null, {
      headers: { Authorization: token}
    })
    .then(res => {
      console.log(res)
    })
    .catch(err => {
      console.log(err)
    })

    // Logs user in if they have a token after refreshing or revisiting page.
    console.log("token", tokenUser, token)
    let hasToken = () => {
      if (token) {
        this.setState({
          username: tokenUser.username,
          id: tokenUser._id
        })
      }
    }
    hasToken();
  }

  initSocket = () => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected', socket.id);
      this.setState({
        socketId: socket.id
      })
    })
  }

  userLogin = ({ username, password }) => {
    axios.post(`${API_URL}/auth/login`, { username, password })
    .then(res => {
      console.log(res);
      cookies.set('token', res.data.token, { path: "/" });
      cookies.set('user', res.data.user, { path: "/" });
      this.setState({
        username: res.data.user.username,
        id: res.data.user._id,
        loginError:[],
        formsShown: false
      })
    })
    .catch(error => {
      // Always show most recent errors
      const errorLog = Array.from(this.state.loginError);

      errorLog.length = [];
      errorLog.push(error);

      this.setState({
        loginError: errorLog
      })
    })
  }

  userLogout = () => {
    cookies.remove('token', { path: '/' });
    cookies.remove('user', { path: '/' });
    this.setState({
      username: "",
      id: "",
      socket: null
    })
  }

  userRegistration = ({ username, password }) => {
    axios.post(`${API_URL}/auth/register`, { username, password })
    .then(res => {
      console.log(res);
      cookies.set('token', res.data.token, { path: "/" });
      cookies.set('user', res.data.user, { path: "/" });
      this.setState({
        username: res.data.username,
        id: res.data.user._id,
        registrationError:[],
        formsShown: false
      })
    })
    .catch(error => {
      // Always show most recent errors
      const errorLog = Array.from(this.state.registrationError);

      errorLog.length = [];
      errorLog.push(error);

      this.setState({
        registrationError: errorLog
      })
    })
  }

  sendMessage = (composedMessage, recipient) => {
    if (!this.state.privateMessage) {
      console.log("posting to channel")
      axios.post(`${API_URL}/chat/postchannel/${this.state.currentChannel}`, { composedMessage }, {
        headers: { Authorization: token }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
    } else {
      axios.post(`${API_URL}/chat/new/${recipient}`, { composedMessage }, {
        headers: { Authorization: token }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.sendMessage(this.state.composedMessage);
  }

  displayForms = (method) => {
    if (method === "login") {
      this.setState({
        formsMethod: "login",
        formsShown: true
      })
    }

    if(method === "register") {
      this.setState({
        formsMethod: "register",
        formsShown: true
      })
    }

    if(method === "close") {
      this.setState({
        formsMethod: "",
        formsShown: false
      })
    }
  }

  closeForm = () => {
    this.setState({
      formsShown: false
    })
  }

  render() {
    return (
      <div>
        <Navigation
          displayForms={this.displayForms}
          userLogout={this.userLogout} 
          {...this.state}
        />
        {
          (this.state.formsMethod === "login" && this.state.formsShown)
            ?   <LoginForm 
                  userLogin={this.userLogin}
                  closeForm={this.closeForm}
                  {...this.state}
                />
            : null
        }
        {
          (this.state.formsMethod === "register" && this.state.formsShown)
            ?   <RegisterForm 
                  userRegistration={this.userRegistration}
                  closeForm={this.closeForm}
                  {...this.state}
                />
            : null
        }
        <div>Chat Room Appears</div>
        <ChatBox 
          handleChange={this.handleChange}
          handleSubmit={this.handleSubmit}
          {...this.state}
        />
      </div>
    )
  }
}