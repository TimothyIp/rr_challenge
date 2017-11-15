import React, { Component } from 'react';
import Moment from 'moment';
import ChatLists from './ChatLists';


export default class ChatBox extends Component {

  scrollDown = () => {
    const { chat_container } = this.refs;
    chat_container.scrollTop = chat_container.scrollHeight;
  }

  componentDidMount() {
    this.scrollDown();
  }

  componentDidUpdate(prevProps, prevState) {
    this.scrollDown();  
  }

  render() {  
    const { handleSubmit, handleChange, currentChannel, channelConversations, id, getUsersConversations, hasToken, socketConversations, composedMessage, username, guestUsername } = this.props;
  
    return (
        <div className="chatapp__mainchat--container">
          {
            (id)
            ? <ChatLists 
                getUsersConversation={getUsersConversations}
                hasToken={hasToken}
                {...this.props}
                />
              : null
          }
          <div className="chatapp__chatbox">
            <h3>Channel: {currentChannel}</h3>
            <div className="chatapp__chatbox--messages" ref="chat_container">
            {
                (channelConversations)
                  ? <ul>
                      {channelConversations.map((message, index) => {
                        return (
                          <li className={(username !== message.author[0].item.username || message.author[0].item.guestName) ? (guestUsername === message.author[0].item.guestName) ? "" : "chat--received" : null} key={`chatMsgId-${index}`}>
                            <div className="speech--bubble--author">
                              {
                                (username === message.author[0].item.username )
                                  ? <p>You</p>
                                  : <p>{message.author[0].item.username || message.author[0].item.guestName}</p>
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
                  : <p>Nothing has been posted in this channel yet.</p>
              }
              {
                (socketConversations)
                  ? <ul>
                      {socketConversations.map((message, index) => {
                        return (
                          <li className={(!message.author) ? "user--joined" : (username !== message.author) ? (guestUsername) ? "" : "chat--received" : null}key={`socketMsgId-${index}`}>
                              {
                                (username !== message.userJoined)
                                  ? <p>{message.userJoined}</p>
                                  : null
                              }
                            <div className="speech--bubble--author">
                              {
                                (username === message.author)
                                  ? <p>You</p>
                                  : <p>{message.author}</p>
                              }
                              <p className="speech--bubble--date">{Moment(message.date).fromNow()}</p>
                            </div>
                            {
                              (!message.userJoined)
                                ? <div className="speech--bubble">
                                    <p>{message.composedMessage}</p>
                                  </div>
                                : null
                            }
                          </li>
                          
                        )
                      })}
                    </ul>
                  : null
              }
            </div>
            <form onSubmit={handleSubmit}>
              <input onChange={handleChange} value={composedMessage} name="composedMessage" placeholder="Type a message here" type="text" autoComplete="off"/>
            </form>
          </div>
        </div>
    )
  }
}