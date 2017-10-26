import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from './components/Navigation';
import ChatUIContainer from './components/container/ChatUIContainer';

class App extends Component {
  constructor() {
    super();
   
    this.displayChat = this.displayChat.bind(this);
    
    this.state = {
      username: "",
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
      <div>
        <Navigation />
        <h2>
          Main page
        </h2>
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
    );
  }
}

export default App;
