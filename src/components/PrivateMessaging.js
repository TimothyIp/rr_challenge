import React, { Component } from 'react';
import Moment from 'moment';

export default class PrivateMessaging extends Component{
  constructor() {
    super();

    this.state = {
      isTyping: false,
    }
  }

  // Scrolls down to the bottom of chat log for most recent messages
  scrollDown = () => {
    const { chat_container } = this.refs;
    chat_container.scrollTop = chat_container.scrollHeight;
  }

  // Checks if the user is typing, if they are, it sets the state of isTyping to true,
  // then it calls the startCheckTyping function
  // Tells server sockets, that someone is typing.
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

  // Sets up intervals which will set the typing to false, if there is no typing after 300ms,
  // it sets state of isTyping to false and calls the stopCheckTyping function
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

  // If there are active intervals running, it clears them and sends the socket that no more user is typing
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

  // If there are active intervals running, we clear them on dismount
  componentWillUnmount() {
    this.stopCheckTyping();
  }

  render() {
    const { handlePrivateInput, handlePrivateSubmit, closePM, currentPrivateRecipient, privateMessageLog, socketPMs, privateMessageInput, showTyping, activeUserTyping, username } = this.props;

    return (
      <div className="private__message--window"  onClick={((e) =>{e.stopPropagation()})}>
        <div className="chatapp__chatbox" id="private__message--input">
          <button onClick={(e) => {closePM(e)}}>&#xf00d;</button>
          <p>Conversation with {currentPrivateRecipient.username}</p>
          <div className="chatapp__chatbox--messages" id="private__chatbox" ref="chat_container">
          {
            (privateMessageLog.length)
              ? <ul>
                    {privateMessageLog.map((message, index) => {
                      return (
                        <li className={(username !== message.author[0].item.username) ? "chat--received" : null} key={`chatMsgId-${index}`}>
                          <div className="speech--bubble--author">
                            {
                              (username === message.author[0].item.username)
                                ? <p>You</p>
                                : <p>{message.author[0].item.username}</p>
                            }
                            <p className="speech--bubble--date">{Moment(message.createdAt).fromNow()}</p>
                          </div>
                          <div className="speech--bubble">
                            <p>{message.body}</p>
                          </div>
                        </li>
                      )
                    })}
                </ul>
              : null
          }
          {
            (socketPMs.length)
              ? <ul>
                  {socketPMs.map((message, index) => {
                    return (
                      <li className={(username !== message.author[0].item.username) ? "chat--received": null} key={`socketPMsId-${index}`}>
                        <div className="speech--bubble--author">
                          {
                            (username === message.author[0].item.username)
                              ? <p>You</p>
                              : <p>{message.author[0].item.username}</p>
                          }
                          <p className="speech--bubble--date">{Moment(message.createdAt).fromNow()}</p>
                        </div>
                        <div className="speech--bubble">
                          <p>{message.body}</p>
                        </div>
                      </li>
                    )
                  })}
                </ul>
              : null
          }
          {
            (activeUserTyping !== this.props.username)
              ? <div className="active__typing">
                  {
                    (showTyping)
                      ? <p>
                        {`${activeUserTyping} is typing...`}
                        </p>
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
          </form>
        </div>
      </div>
    )
  } 
}