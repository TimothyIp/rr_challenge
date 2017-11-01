import React, { Component } from 'react';
import Moment from 'moment';

export default class PrivateMessaging extends Component{
  constructor() {
    super();

    this.state = {
      isTyping: false,
    }
  }

  scrollDown = () => {
    const { chat_container } = this.refs;
    chat_container.scrollTop = chat_container.scrollHeight;
  }

  sendTyping = () => {
    this.lastUpdateTime = Date.now();

    if (!this.state.isTyping) {
      this.setState({
        isTyping: true
      })
      this.props.userTyping(true)
      this.startCheckTyping();
    }
  }

  startCheckTyping = () => {
    this.typingInterval = setInterval(() => {
      if((Date.now() - this.lastUpdateTime) > 300) {
        this.setState({
          isTyping: false
        });
        this.stopCheckTyping();
      }
    }, 300)
  }

  stopCheckTyping = () => {
    if (this.typingInterval) {
      clearInterval(this.typingInterval)
      this.props.userTyping(false);
    }
  }

  componentDidMount() {
    this.scrollDown();
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollDown();  
  }

  componentWillUnmount() {
    this.stopCheckTyping();
  }

  render() {
    const { handlePrivateInput, handlePrivateSubmit, closePM, currentPrivateRecipient, privateMessageLog, socketPMs, privateMessageInput, showTyping, activeUserTyping } = this.props;

    const privateMsg_container = {
      width: "100%",
      height: "590px",
      border: "1px solid black",
      overflow: "scroll"
    }

  
    return (
      <div>
        <h3>Private Messaging Window</h3>
        <p>Conversation with {currentPrivateRecipient.username}</p>
        <button onClick={() => {closePM()}}>Close</button>
        <div ref="chat_container" style={privateMsg_container}>
        {
          (privateMessageLog.length)
            ? <ul>
                  {privateMessageLog.map((message, index) => {
                    return (
                      <li key={`chatMsgId-${index}`}>
                        <p>{message.author[0].item.username}</p>
                        <p>{Moment(message.createdAt).fromNow()}</p>
                        <p>{message.body}</p>
                      </li>
                    )
                  })}
              </ul>
            : <div>No current chat. Send them a message!</div>
        }
        {
          (socketPMs.length)
            ? <ul>
                {socketPMs.map((message, index) => {
                  return (
                    <li key={`socketPMsId-${index}`}>
                      <p>{message.author[0].item.username}</p>
                      <p>{Moment(message.createdAt).fromNow()}</p>
                      <p>{message.body}</p>
                    </li>
                  )
                })}
              </ul>
            : null
        }
        {
          (activeUserTyping !== this.props.username)
            ? <div>
                {
                  (showTyping)
                    ? `${activeUserTyping} is typing...`
                    : null
                }
              </div>
            : null
        }
        
        </div>
        <form onSubmit={handlePrivateSubmit}>
          <input 
          onChange={handlePrivateInput} 
          value={privateMessageInput} 
          name="privateMessageInput" 
          type="text" 
          placeholder="Write a message" 
          autoComplete="off"
          onKeyUp= { e => { e.keyCode !== 13 && this.sendTyping()} }
          />
          <button>Send</button>
        </form>
      </div>
    )
  } 
}