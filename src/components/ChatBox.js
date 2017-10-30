import React from 'react';
import Moment from 'moment';
import ChatLists from './ChatLists';


const ChatBox = (props) => {

  const layoutContainer = {
    display: "flex",
    flexDirection: "row",
    width: "100%",
  }

  const messageBox = {
    width: "100%",
    height: "590px",
    border: "1px solid black",
    overflow: "scroll"
  }

  const chatBox = {
    flexDirection: "column",
    width: "50%"
  }

  const { handleSubmit, handleChange, currentChannel, channelConversations, id, getUsersConversations, hasToken, socketConversations, composedMessage } = props;

  return (
      <div style={layoutContainer}>
        {
          (id)
          ? <ChatLists 
              getUsersConversation={getUsersConversations}
              hasToken={hasToken}
              {...props}
              />
            : null
        }
        <div style={chatBox}>
          <h3>Current Channel: {currentChannel}</h3>
          <div style={messageBox}>
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

export default ChatBox;