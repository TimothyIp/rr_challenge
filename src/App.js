import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import ChatUIContainer from './components/container/ChatUIContainer';
import { CookiesProvider } from 'react-cookie';

class App extends Component {
  constructor() {
    super();

    this.state = {
      chatShown: true
    }
  }

  displayChat = () => {
    this.setState(prevState => ({
      chatShown: !prevState.chatShown
    }))
  }

  render() {
    return (
      <CookiesProvider>
        <div>
          <h2>
            Real Time Chat App Component
          </h2>
          <p>Built with React, Socket.io, Express, Node.js, MongoDB</p>
          {
            (this.state.chatShown)
              ? <ChatUIContainer />
              : null
          }
          {
            (this.state.chatShown)
              ?  <button onClick={this.displayChat}>Leave the Chat!</button>
              :  <button onClick={this.displayChat}>Join the Chat!</button>
          }
        </div>
      </CookiesProvider>
    );
  }
}

export default App;
