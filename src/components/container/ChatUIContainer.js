import React, { Component } from 'react';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import { withCookies, Cookies } from 'react-cookie'
import axios from 'axios';
import Navigation from '../Navigation';
import ChatBox from '../ChatBox';
import ChatSelector from '../ChatSelector';
import io from 'socket.io-client';
import Moment from 'moment';


const API_URL = 'http://localhost:3000/api';
const SOCKET_URL = "http://localhost:3000";
const socket = io(SOCKET_URL);

class ChatUIContainer extends Component {
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
      socketConversations: [],
      channelUsers: [],
      usersChannels: [],
      token:""
    }
  }

  componentWillMount() {
    this.initSocket();
  }

  componentDidMount() {
    // Logs user or guest in if they have a token after refreshing or revisiting page.
    this.hasToken();
    // console.log("token", tokenUser, token)

    const currentChannel = this.state.currentChannel;

    socket.on('connect', () => {
      socket.emit('enter channel', currentChannel, this.setUsername())
    })

    socket.on('user joined', (data) => {
      const channelUsers = Array.from(this.state.channelUsers);
      const userJoined = Array.from(this.state.socketConversations);
      channelUsers.push(data);

      userJoined.push({
        userJoined: data
      })

      this.setState({
        channelUsers,
        socketConversations: userJoined
      })
    })

    socket.on('refresh messages', (data) => {
      console.log('received refresh socket', data)
      const newSocketConversations = Array.from(this.state.socketConversations);
      newSocketConversations.push(data)
      this.setState({
        socketConversations: newSocketConversations
      })
    })

    // Get current channels messages
    this.getChannelConversations();
  }



  hasToken = () => {
    const { cookies } = this.props;
    const token = cookies.get('token');
    const guestToken = cookies.get('guestToken');
    const tokenUser = cookies.get('user');
    const tokenGuestUser = cookies.get('guestUser');
    const usersChannels = cookies.get('usersChannels');

    if (token) {
      this.setState({
        username: tokenUser.username,
        guestUsername: "",
        id: tokenUser._id,
        token,
        usersChannels
      });
    } else if (guestToken) {
      this.setState({
        guestUsername: tokenGuestUser,
        token: guestToken
      });
    }
  };

  // Checks username, then return whether a username or guestname
  setUsername = () => {
    const username = this.state.username;
    const guestUsername = this.state.guestUsername;

    if (!username) {
      return guestUsername
    } else {
      return username
    }
  }

  initSocket = () => {
    socket.on('connect', () => {
      console.log('Connected', socket.id);
      this.setState({
        socket
      })
    })
  }

  async userLogin({ username, password }) {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;  
    
    try {
      const userData = await axios.post(`${API_URL}/auth/login`, { username, password });
      cookies.set('token', userData.data.token, { path: "/" });
      cookies.set('user', userData.data.user, { path: "/" });
      cookies.set('usersChannels', userData.data.user.usersChannels, { path: "/" });
      
      this.setState({
        guestUsername:"",
        username: userData.data.user.username,
        formsShown: false,
        token: userData.data.token,
        id: userData.data.user._id,
        loginError:[],
        usersChannels: userData.data.user.usersChannels
      }, () => {
        socket.emit('enter channel', currentChannel, this.setUsername());   
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
    const { cookies } = this.props;
    cookies.remove('token', { path: '/' });
    cookies.remove('user', { path: '/' });
    cookies.remove('guestToken', { path: "/" })
    cookies.remove('guestUser', { path: "/" })

    this.setState({
      username: "",
      id: "",
      guestUsername: "",
      socket: null
    });
  }

  userRegistration = ({ username, password }) => {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;

    axios.post(`${API_URL}/auth/register`, { username, password })
    .then(res => {
      console.log(res);
      cookies.set('token', res.data.token, { path: "/" })
      cookies.set('user', res.data.user, { path: "/" })

      this.setState({
        username: res.data.username,
        id: res.data.user._id,
        registrationError:[],
        token:res.data.token,
        formsShown: false,
        guestUsername:"",
        usersChannels: res.data.user.usersChannels
      }, () => {
        socket.emit('enter channel', currentChannel, this.setUsername());           
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

  async guestLogin(e) {
    e.preventDefault();
    const { cookies } = this.props;
    const guestInputName = this.state.guestSignup;
    const currentChannel = this.state.currentChannel;
    
    try {
      const guestInfo = await axios.post(`${API_URL}/auth/guest`, { guestInputName })
      console.log(guestInfo)
      cookies.set('guestToken', guestInfo.data.token, { path: "/" })
      cookies.set('guestUser', guestInfo.data.guestUser.guest.guestName, { path: "/" })

      this.setState({
        guestUsername: guestInfo.data.guestUser.guest.guestName,
        token: guestInfo.data.token,
        loginError: []
      }, () => {
        socket.emit('enter channel', currentChannel, this.setUsername());           
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
    const currentChannel = this.state.currentChannel;

    // If the message is not a private one, post it to the channel instead of recipient
    if (!this.state.privateMessage) {
      console.log("posting to channel")
      axios.post(`${API_URL}/chat/postchannel/${this.state.currentChannel}`, { composedMessage }, {
        headers: { Authorization: this.state.token }
      })
      .then(res => {
        const socketMsg = {
          composedMessage,
          channel: currentChannel,
          author: this.state.username || this.state.guestUsername,
          date: Moment().format()
        }
        socket.emit('new message', socketMsg)
        console.log(res)
        this.setState({
          composedMessage: ""
        })
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
        this.setState({
          composedMessage: "",
        })
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

export default withCookies(ChatUIContainer);