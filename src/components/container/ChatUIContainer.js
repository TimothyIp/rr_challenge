import React, { Component } from 'react';
import PropTypes from 'prop-types';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';
import { withCookies } from 'react-cookie'
import axios from 'axios';
import Navigation from '../Navigation';
import ChatBox from '../ChatBox';
import ChatSelector from '../ChatSelector';
import io from 'socket.io-client';
import Moment from 'moment';
import PrivateMessagingContainer from './PrivateMessageContainer';


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
      formsMethod: "guest",
      chatsShown: false,
      socket: null,
      composedMessage: "",
      currentChannel: "Public-Main",
      conversations: [],
      channelConversations: [],
      guestSignup: "",
      guestUsername: "",
      socketConversations: [],
      usersChannels: [],
      createInput: "",
      startDmInput: "",
      usersDirectMessages:[],
      directMessageErrorLog: [],
      currentPrivateRecipient: {},
      token:""
    }
  }

  componentDidMount() {
    // Logs user or guest in if they have a token after refreshing or revisiting page.
    this.hasToken();

    // Initialize the socket listeners for events from the backend
    this.initSocket();

    // Get current channels messages
    this.getChannelConversations();
  }

  // Sets up socket listeners to listen for when to refresh messages, when a new user has joined,
  // or when a user has left the channel
  initSocket = () => {
    this.setState({
        socket
      })

    socket.on('refresh messages', (data) => {
      const newSocketConversations = Array.from(this.state.socketConversations);
      
      newSocketConversations.push(data)

      this.setState({
        socketConversations: newSocketConversations
      })
    });

    socket.on('user joined', data => {
      const userJoined = Array.from(this.state.socketConversations);

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
      });

      this.setState({
        socketConversations: userJoined
      }); 
    });
  }

  componentDidUpdate(prevProps, prevState) {
    // Tells socket when a user has left channel by comparing against previous and new channel states
    if (prevState.currentChannel !== this.state.currentChannel) {
      socket.emit('leave channel', prevState.currentChannel, this.setUsername())
    }
  }

  // If a token can be found, it will populate back the user's information on browser refresh
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
        guestSignup: "",
        id: tokenUser._id,
        token,
        usersChannels,
        currentChannel: currentChannel || "Public-Main",
        formsMethod:"",
        formsShown: false
      });
    } else if (guestToken) {
      this.setState({
        guestUsername: tokenGuestUser,
        token: guestToken,
        formsMethod: "",
        formsShown: false
      });
    }
  };

  // Checks username, then return whether it current is a username or guestname
  setUsername = () => {
    const username = this.state.username;
    const guestUsername = this.state.guestUsername;

    if (!username) {
      return guestUsername
    } else {
      return username
    }
  }

  // Takes a username and password
  // POST calls to the backend api with that information
  // If the login is successful, cookies are set with the token, user's data, and their channels
  async userLogin({ username, password }) {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;  
    
    try {
      const userData = await axios.post(`${API_URL}/auth/login`, { username, password });
      cookies.set('token', userData.data.token, { path: "/", maxAge: 7200 });
      cookies.set('user', userData.data.user, { path: "/", maxAge: 7200 });
      cookies.set('usersChannels', userData.data.user.usersChannels, { path: "/", maxAge: 7200 });
      
      this.setState({
        guestUsername:"",
        username: userData.data.user.username,
        formsShown: false,
        token: userData.data.token,
        id: userData.data.user._id,
        loginError:[],
        guestSignup: "",
        usersChannels: userData.data.user.usersChannels,
        formsMethod:"",
      }, () => {
        // After the login state is set, tell the backend sockets that a new user has entered
        socket.emit('enter channel', currentChannel, this.setUsername());   
      });
    } catch(error) {
        const errorLog = Array.from(this.state.loginError);
      
        // Always show most recent errors
        errorLog.length = [];
        errorLog.push(error);
  
        this.setState({
          loginError: errorLog
        });
    }
  }

  // On logout, remove all cookies that were saved and emit to the backend socket listener
  // that a user has left the current channel.
  // Sets the state back to fresh
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
      token: "",
      usersChannels: [],
      socketConversations: [],
      guestSignup: "",      
      currentChannel: "Public-Main",
      formsMethod: "login",
      formsShown: true
    });
  }

  // Takes a username and password, then makes a POST call to our api which returns a token and that user's info
  // Then sets cookies of the given token, user data, and users channels
  userRegistration = ({ username, password }) => {
    const { cookies } = this.props;
    const currentChannel = this.state.currentChannel;

    axios.post(`${API_URL}/auth/register`, { username, password })
    .then(res => {
      cookies.set('token', res.data.token, { path: "/", maxAge: 7200 })
      cookies.set('user', res.data.user, { path: "/", maxAge: 7200 })
      cookies.set('usersChannels', res.data.user.usersChannels, { path: "/", maxAge: 7200 })

      this.setState({
        username: res.data.user.username,
        id: res.data.user._id,
        registrationError:[],
        token:res.data.token,
        formsShown: false,
        guestUsername:"",
        guestSignup: "",       
        usersChannels: res.data.user.usersChannels,
        formsMethod:""
      }, () => {
        // Tells the backend sockets that a user has entered a channel
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

  // Guest signup, on successful POST call to our api, it returns a token and guest's data
  // Saves the token and guestname as cookies 
  async guestLogin(e) {
    e.preventDefault();
    const { cookies } = this.props;
    const guestInputName = this.state.guestSignup;
    const currentChannel = this.state.currentChannel;
    
    try {
      const guestInfo = await axios.post(`${API_URL}/auth/guest`, { guestInputName })

      cookies.set('guestToken', guestInfo.data.token, { path: "/", maxAge: 7200 })
      cookies.set('guestUser', guestInfo.data.guestUser.guest.guestName, { path: "/", maxAge: 7200 })

      this.setState({
        guestUsername: guestInfo.data.guestUser.guest.guestName,
        token: guestInfo.data.token,
        loginError: [],
        guestSignup: "",
        formsMethod: "",
        formsShown: false,
      }, () => {
        // Tells backend sockets that a new user has entered the channel
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

  // GET calls to backend API with the given current channel name.
  // responds back with all the conversations in that given channel
  getChannelConversations = () => {
    axios.get(`${API_URL}/chat/channel/${this.state.currentChannel}`)
    .then(res => {
      const currentChannel = this.state.currentChannel;
  
      socket.emit('enter channel', currentChannel, this.setUsername());

      this.setState({
        channelConversations: res.data.channelMessages
      });
    })
    .catch(error => {
      console.log(error)
    })
  }

  // GET call to the backend api with the token given from login in the header.
  // this returns a list of all the user's active conversations
  getUsersConversations = () => {
    axios.get(`${API_URL}/chat`, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {
      const updatedUsersDirectMessages = res.data.conversationsWith;

      this.setState({
        usersDirectMessages: updatedUsersDirectMessages || []
      });
    })
    .catch(err => {
      console.log(err)
    });
  }

  // Takes a message and recipient, then makes a POST call with the message in the body of the call
  // as well as the token given on login in the header.
  // On successful post call, the message is saved to mongodb
  // This then emits to the socket listeners on the server that a message was sent,
  // which returns a refresh message message for us to get updated messages from the mongodb.
  sendMessage = (composedMessage, recipient) => {
    const socket = this.state.socket;
    const currentChannel = this.state.currentChannel;

    axios.post(`${API_URL}/chat/postchannel/${this.state.currentChannel}`, { composedMessage }, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {
      const socketMsg = {
        composedMessage,
        channel: currentChannel,
        author: this.state.guestUsername || this.state.username,
        date: Moment().format()
      }
      socket.emit('new message', socketMsg)

      this.setState({
        composedMessage: ""
      })
    })
    .catch(err => {
      console.log(err)
    })
  
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

  // Takes a channel name and then makes a POST call to the backend API,
  // requires a token for authorization to create a channel.
  // On success, the new array is pushed into the user's current user channel,
  // and saves the new channel list in cookie and refreshes channel conversations.
  createChannel = (e) => {
    const { cookies } = this.props;
    const createInput = this.state.createInput;
    e.preventDefault();

    axios.post(`${API_URL}/user/addchannel`, { createInput }, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {      
      const updatedUsersChannels = Array.from(this.state.usersChannels);

      updatedUsersChannels.push(this.state.createInput);

      cookies.set('usersChannels', updatedUsersChannels, { path: "/", maxAge: 7200 });

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

  // Takes a channel name parameter, then a POST call with authorization token to backend API,
  // On success, cookies are set of the updated user channels 
  removeChannel = (channel) => {   
    const { cookies } = this.props;
    
    axios.post(`${API_URL}/user/removechannel`, { channel }, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {
      const updatedChannels = res.data.updatedChannels;

      cookies.set('usersChannels', updatedChannels, { path: "/", maxAge: 7200 });
      
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

  // Takes a channel name parameter, saves it as a cookie, then sets the state of current channel,
  // to that channel paramter.
  joinChannel = (channel) => {
    const { cookies } = this.props;

    cookies.set('channel', channel, { path: "/", maxAge: 7200 });
    
    this.setState({
      socketConversations: [],      
      currentChannel: channel
    }, () => {this.getChannelConversations()})
  }

  // Takes the input and checks against user's conversation to see if their are duplicates,
  // On success, a POST call is made with the message
  startConversation = (e) => {
    const startDmInput = this.state.startDmInput;
    const usersDirectMessages = this.state.usersDirectMessages;
    e.preventDefault();

    const checkForCurrentConvos = usersDirectMessages.filter(directMessage => {
      return directMessage.username === startDmInput
    })

    // Checks if already in current conversation with that person
    if (!checkForCurrentConvos.length || !usersDirectMessages.length) {
      axios.post(`${API_URL}/chat/new`, { startDmInput }, {
        headers: { Authorization: this.state.token }
      })
      .then(res => {
        const newUsersDirectMessages = Array.from(this.state.usersDirectMessages)
        
        newUsersDirectMessages.push({
          username: res.data.recipient,
          _id: res.data.recipientId,
        })
        
        this.setState({
          usersDirectMessages: newUsersDirectMessages,
          directMessageErrorLog: []
        })
      })
      .catch(err => {
        const updatedErrorLog = Array.from(this.state.directMessageErrorLog);

        updatedErrorLog.push(err);

        this.setState({
          directMessageErrorLog: updatedErrorLog
        })

      })
    } else {
      const updatedErrorLog = Array.from(this.state.directMessageErrorLog);

      updatedErrorLog.push({
        //Had to emulate response from backend for error the alert component
        response:{
          data: {
            error: 'Already in conversation with that person.'
          }
        }
      });

      this.setState({
        directMessageErrorLog: updatedErrorLog
      })
    }
  }

  // Takes a conversation id and user parameter
  // POST calls with the conversation id to the backend
  // On success, it removes that conversation from the users data
  // then alter the current conversations state to reflect the new change, so we dont need to refresh.
  leaveConversation = (conversationId, user) => {
    axios.post(`${API_URL}/chat/leave`, {conversationId}, {
      headers: { Authorization: this.state.token }
    })
    .then(res => {
      const directMessages = Array.from(this.state.usersDirectMessages);

      const newDirectMessages = directMessages.filter((directMessages) => {
        return directMessages.username !== user
      })

      this.setState({
        usersDirectMessages: newDirectMessages
      })
    })
    .catch(err => {
      console.log(err)
    })
  }

  choosePrivateMessageRecipient = (recipient) => {
    this.setState({
      currentPrivateRecipient: recipient
    })
  }

  // Depending on the parameter, different pages are shown
  // The Login, Register or the Guest sign up page. 
  displayForms = (method) => {
    if (method === "login") {
      this.setState({
        loginError: [],
        formsMethod: "login",
        formsShown: true,
        guestUsername: ""
      });
    }

    if (method === "register") {
      this.setState({
        formsMethod: "register",
        formsShown: true,
        guestUsername: ""
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
      formsMethod: "guest",
      formsShown: false
    });
  }

  closePM = (e) => {
    e.stopPropagation();
    this.setState({
      currentPrivateRecipient: {}
    })
  }

  // When the component unmounts, we detach all the listeners and give the server sockets a leave channel signal
  componentWillUnmount() {
    const currentChannel = this.state.currentChannel;

    socket.emit('leave channel', currentChannel, this.setUsername());
    socket.off('refresh messages');
    socket.off('user joined');
    socket.off('user left');
  }

  render() {
    return (
      <div className="chatapp__container">
        <Navigation
          displayForms={this.displayForms}
          userLogout={this.userLogout} 
          closeForm={this.closeForm}
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
              ?  <RegisterForm 
                    userRegistration={this.userRegistration}
                    closeForm={this.closeForm}
                    {...this.state}
                 />
              : null
          }
          {
            (this.state.formsMethod === "guest")
              ? <ChatSelector 
                  handleChange={this.handleChange}
                  guestLogin={this.guestLogin}
                  {...this.state}
                />
              : null
          }
        {
          (this.state.id || this.state.guestUsername)
            ? <ChatBox 
                handleChange={this.handleChange}
                handleSubmit={this.handleSubmit}
                createChannel={this.createChannel}
                removeChannel={this.removeChannel}
                startConversation={this.startConversation}
                leaveConversation={this.leaveConversation}
                joinChannel={this.joinChannel}
                choosePrivateMessageRecipient={this.choosePrivateMessageRecipient}
                getUsersConversations={this.getUsersConversations}
                hasToken={this.hasToken}
                {...this.state}
              />
            : null
        }
        {
          (Object.getOwnPropertyNames(this.state.currentPrivateRecipient).length !== 0)
            ? <PrivateMessagingContainer 
                usersDirectMessages={this.state.usersDirectMessages}
                closePM={this.closePM}
                currentPrivateRecipient={this.state.currentPrivateRecipient}
                token={this.state.token}
                username={this.state.username}
               />
               
            : null
        }
      </div>
    )
  }
}

ChatUIContainer.propTypes = {
  username: PropTypes.string,
  id: PropTypes.string,
  loginError: PropTypes.array,
  registrationError: PropTypes.array,
  formsShown: PropTypes.bool,
  formsMethod: PropTypes.string,
  chatsShown: PropTypes.bool,
  composedMessage: PropTypes.string,
  currentChannel: PropTypes.string,
  conversations: PropTypes.array,
  channelConversations: PropTypes.array,
  guestSignup: PropTypes.string,
  guestUsername: PropTypes.string,
  socketConversations: PropTypes.array,
  usersChannels: PropTypes.array,
  createInput: PropTypes.string,
  startDmInput: PropTypes.string,
  usersDirectMessages:PropTypes.array,
  directMessageErrorLog: PropTypes.array,
  currentPrivateRecipient: PropTypes.object,
  token:PropTypes.string
}

export default withCookies(ChatUIContainer);