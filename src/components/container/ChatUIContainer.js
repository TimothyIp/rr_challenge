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
      usersChannels: [],
      createInput: "",
      token:""
    }
  }

  componentDidMount() {
    
    // Logs user or guest in if they have a token after refreshing or revisiting page.
    this.hasToken();
    
    // Get current channels messages
    this.getChannelConversations();
    
    this.initSocket();    
  }

  initSocket = () => {
    const currentChannel = this.state.currentChannel;

    this.setState({
        socket
      })

    socket.on('connect', () => {
      console.log('Connected', socket.id);
      socket.emit('enter channel', currentChannel, this.setUsername())
    });

    socket.on('refresh messages', (data) => {
      console.log('received refresh socket', data)
      const newSocketConversations = Array.from(this.state.socketConversations);
      
      newSocketConversations.push(data)

      this.setState({
        socketConversations: newSocketConversations
      })
    });

    socket.on('user joined', data => {
      const userJoined = Array.from(this.state.socketConversations);
      const activeUser = data.split(" ");

      userJoined.push({
        userJoined: data
      })

      this.setState({
        socketConversations: userJoined
      })
    });

    socket.on('user left', data => {
      const userJoined = Array.from(this.state.socketConversations);
      
      userJoined.push({
        userJoined: data
      })

      this.setState({
        socketConversations: userJoined
      })      
    });

    socket.emit('enter channel', currentChannel, this.setUsername())    
  }

  componentDidUpdate(prevProps, prevState) {
    // Tells socket when user has left channel
    if (prevState.currentChannel !== this.state.currentChannel) {
      socket.emit('leave channel', prevState.currentChannel, this.setUsername())
    }
  }

  hasToken = () => {
    const { cookies } = this.props;
    const token = cookies.get('token');
    const guestToken = cookies.get('guestToken');
    const tokenUser = cookies.get('user');
    const tokenGuestUser = cookies.get('guestUser');
    const usersChannels = cookies.get('usersChannels');
    const currentChannel = cookies.get('channel');

    if (token) {
      this.setState({
        username: tokenUser.username,
        guestUsername: "",
        id: tokenUser._id,
        token,
        usersChannels,
        currentChannel: currentChannel || "Public-Main"
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

  async userLogin({ username, password }) {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;  
    
    try {
      const userData = await axios.post(`${API_URL}/auth/login`, { username, password });
      cookies.set('token', userData.data.token, { path: "/" });
      cookies.set('user', userData.data.user, { path: "/" });
      cookies.set('usersChannels', userData.data.user.usersChannels, { path: "/" });
      
      console.log(userData)

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
    const currentChannel = this.state.currentChannel;
    cookies.remove('token', { path: '/' });
    cookies.remove('user', { path: '/' });
    cookies.remove('guestToken', { path: "/" });
    cookies.remove('guestUser', { path: "/" });
    cookies.remove('usersChannels', { path: "/" });
    cookies.remove('channel', { path: "/" });
    
    socket.emit('leave channel', currentChannel, this.setUsername())      
    
    this.setState({
      username: "",
      id: "",
      guestUsername: "",
      socket: null,
      token: "",
      usersChannels: [],
      socketConversations: [],      
      currentChannel: "Public-Main"
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
      cookies.set('usersChannels', res.data.user.usersChannels, { path: "/" })

      this.setState({
        username: res.data.user.username,
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

  createChannel = (e) => {
    const { cookies } = this.props;
    const createInput = this.state.createInput;
    const currentChannel = this.state.currentChannel;
    e.preventDefault();

    axios.post(`${API_URL}/user/addchannel`, { createInput }, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {
      console.log(res)
      
      const updatedUsersChannels = Array.from(this.state.usersChannels);

      updatedUsersChannels.push(this.state.createInput);

      cookies.set('usersChannels', updatedUsersChannels, { path: "/" });

      socket.emit('enter channel', currentChannel, this.setUsername())

      this.setState({
        socketConversations:[],
        currentChannel: createInput,
        usersChannels: updatedUsersChannels
      }, () => {this.getChannelConversations()})
    })
    .catch(err => {
      console.log(err)
    })
  }

  removeChannel = (channel) => {   
    const { cookies } = this.props;
    
    axios.post(`${API_URL}/user/removechannel`, { channel }, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {
      const updatedChannels = res.data.updatedChannels;

      cookies.set('usersChannels', updatedChannels, { path: "/" });
      
      this.joinChannel("Public-Main");
      this.setState({
        socketConversations: [],        
        usersChannels: updatedChannels
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  joinChannel = (channel) => {
    const { cookies } = this.props;

    cookies.set('channel', channel, { path: "/" });

    socket.emit('enter channel', channel, this.setUsername())
    
    this.setState({
      socketConversations: [],      
      currentChannel: channel
    }, () => {this.getChannelConversations()})
  }

  displayForms = (method) => {
    if (method === "login") {
      this.setState({
        formsMethod: "login",
        formsShown: true
      });
    }

    if (method === "register") {
      this.setState({
        formsMethod: "register",
        formsShown: true
      });
    }

    if (method === "close") {
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

  componentWillUnmount() {
    socket.off('refresh messages');
    socket.off('user joined');
    socket.off('user left');
    socket.off('connect');
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
                createChannel={this.createChannel}
                removeChannel={this.removeChannel}
                joinChannel={this.joinChannel}
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