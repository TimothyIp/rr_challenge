import React, { Component } from 'react';

export default class ChatUI extends Component {
  constructor(){
    super();
    
    this.displayChat = this.displayChat.bind(this);

    this.state = {
      username: "",
      chatShown: false
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
        {
          (this.state.chatShown)
            ? <div> Chat Room appears!</div>
            : null
        }
        <button onClick={this.displayChat}>Join Chat</button>
      </div>
    )
  }
}