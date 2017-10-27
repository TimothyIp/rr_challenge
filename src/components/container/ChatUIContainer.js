import React, { Component } from 'react';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import Cookies from 'universal-cookie';
import axios from 'axios';
import Navigation from '../Navigation';
import ChatBox from '../ChatBox';
import ChatSelector from '../ChatSelector';
import io from 'socket.io-client';


const API_URL = 'http://localhost:3000/api';
const cookies = new Cookies();
const token = cookies.get('token');
const tokenUser = cookies.get('user');
const SOCKET_URL = "http://localhost:3000";

export default class ChatUIContainer extends Component {
  constructor(){
    super();
    
    this.userLogin = this.userLogin.bind(this);
    this.guestLogin = this.guestLogin.bind(this);

    this.state = {
      username: "",
      id: "",
      loginError: [],
      registrationError: [],
      formsShown: false,
      formsMethod: "",
      chatsShown: false,
      socket: null,
      composedMessage: "",
      currentChannel: "Public-Main",
      privateMessage: "",
      conversations: [],
      channelConversations: [],
      guestSignup: "",
      guestUsername: "",
      token:""
    }
  }

  componentWillMount() {
    this.initSocket();
  }

  componentDidMount() {
    // Logs user in if they have a token after refreshing or revisiting page.
    this.hasToken();
    console.log("token", tokenUser, token)

    // Get current channels messages
    this.getChannelConversations();
  }

  hasToken = () => {
    if (token) {
      this.setState({
        username: tokenUser.username,
        id: tokenUser._id,
        token
      });
    }
  };

  initSocket = () => {
    const socket = io(SOCKET_URL);

    socket.on('connect', () => {
      console.log('Connected', socket.id);
      this.setState({
        socket
      })
    })
  }

  async userLogin({ username, password }) {
    try {
      const userData = await axios.post(`${API_URL}/auth/login`, { username, password });
      cookies.set('token', userData.data.token, { path: "/" })
      cookies.set('user', userData.data.user, { path: "/" })
      this.setState({
        username: userData.data.user.username,
        id: userData.data.user._id,
        loginError:[],
        formsShown: false,
        token: userData.data.token,
        guestUsername:""
      });
    } catch(error) {
        // Always show most recent errors
        const errorLog = Array.from(this.state.loginError);
  
        errorLog.length = [];
        errorLog.push(error);
  
        this.setState({
          loginError: errorLog
        });
    }
  }

  userLogout = () => {
    cookies.remove('token', { path: '/' });
    cookies.remove('user', { path: '/' });
    this.setState({
      username: "",
      id: "",
      socket: null
    });
  }

  userRegistration = ({ username, password }) => {
    axios.post(`${API_URL}/auth/register`, { username, password })
    .then(res => {
      console.log(res);
      cookies.set('token', res.data.token, { path: "/" })
      cookies.set('user', res.data.user, { path: "/" })

      this.setState({
        username: res.data.username,
        id: res.data.user._id,
        registrationError:[],
        formsShown: false,
        guestUsername:""
      });
    })
    .catch(error => {
      // Always show most recent errors
      const errorLog = Array.from(this.state.registrationError);

      errorLog.length = [];
      errorLog.push(error);

      this.setState({
        registrationError: errorLog
      });
    });
  }

  getChannelConversations = () => {
    axios.get(`${API_URL}/chat/channel/${this.state.currentChannel}`)
    .then(res => {
      this.setState({
        channelConversations: res.data.channelMessages
      });
    })
    .catch(error => {
      console.log(error)
    })
  }

  getUsersConversations = () => {
    axios.get(`${API_URL}/chat`, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {
      this.setState({
        conversations: res.data.conversations || []
      })
    })
    .catch(err => {
      console.log(err)
    });
  }

  sendMessage = (composedMessage, recipient) => {
    const socket = this.state.socket;

    // If the message is not a private one, post it to the channel instead of recipient
    if (!this.state.privateMessage) {
      console.log("posting to channel")
      axios.post(`${API_URL}/chat/postchannel/${this.state.currentChannel}`, { composedMessage }, {
        headers: { Authorization: this.state.token }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      })
    } else {
      axios.post(`${API_URL}/chat/new/${recipient}`, { composedMessage }, {
        headers: { Authorization: this.state.token }
      })
      .then(res => {
        console.log(res)
      })
      .catch(err => {
        console.log(err)
      });
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();

    this.sendMessage(this.state.composedMessage);
  }

  async guestLogin(e) {
    e.preventDefault();
    const guestInputName = this.state.guestSignup;
    
    try {
      const guestInfo = await axios.post(`${API_URL}/auth/guest`, { guestInputName })
      console.log(guestInfo)
      this.setState({
        guestUsername: guestInfo.data.guestUser.guest.guestName,
        token: guestInfo.data.token,
        loginError: []
      })      
    } catch(error) {
      const guestError = Array.from(this.state.loginError);
      console.log("guest login error", guestInputName)
      guestError.push(error);

      this.setState({
        loginError: guestError
      })
    }
  }

  displayForms = (method) => {
    if (method === "login") {
      this.setState({
        formsMethod: "login",
        formsShown: true
      });
    }

    if(method === "register") {
      this.setState({
        formsMethod: "register",
        formsShown: true
      });
    }

    if(method === "close") {
      this.setState({
        formsMethod: "",
        formsShown: false
      });
    }
  }

  closeForm = () => {
    this.setState({
      formsShown: false
    });
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
        {
          (this.state.id || this.state.guestUsername)
            ? <ChatBox 
                handleChange={this.handleChange}
                handleSubmit={this.handleSubmit}
                getUsersConversations={this.getUsersConversations}
                hasToken={this.hasToken}
                {...this.state}
              />
            : <ChatSelector 
              handleChange={this.handleChange}
              guestLogin={this.guestLogin}
              {...this.state}
              />
        }
      </div>
    )
  }
}