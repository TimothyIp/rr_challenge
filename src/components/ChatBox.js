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
    const { handleSubmit, handleChange, currentChannel, channelConversations, id, getUsersConversations, hasToken, socketConversations, composedMessage } = this.props;
  
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
                          <li key={`chatMsgId-${index}`}>
                            <p>{message.body}</p>
                            <p>Posted by: {message.author[0].item.username || message.author[0].item.guestName}</p>
                            <p>{Moment(message.createdAt).fromNow()}</p>
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
                          <li key={`socketMsgId-${index}`}>
                            <p>{message.composedMessage}</p>
                            <p>{message.author}</p>
                            <p>{message.userJoined}</p>
                            <p>{Moment(message.date).fromNow()}</p>
                          </li>
                          
                        )
                      })}
                    </ul>
                  : null
              }
            </div>
            <form onSubmit={handleSubmit}>
              <input onChange={handleChange} value={composedMessage} name="composedMessage" type="text" autoComplete="off"/>
              <button>Send</button>
            </form>
          </div>
        </div>
    )
  }
}