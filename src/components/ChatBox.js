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
    width: "720px",
    height: "590px",
    border: "1px solid black",
    overflow: "scroll"
  }

  const chatBox = {
    flexDirection: "column",
    width: "50%"
  }

  const { handleSubmit, handleChange, currentChannel, channelConversations, id, getUsersConversations } = props;

  return (
      <div style={layoutContainer}>
        {
          (id)
          ? <ChatLists 
              getUsersConversation={getUsersConversations}
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
                          <p>{message.author.username}</p>
                          <p>{Moment(message.createdAt).fromNow()}</p>
                        </li>
                      )
                    })}
                  </ul>
                : <p>Nothing has been posted in this channel yet.</p>
            }
          </div>
          <form onSubmit={handleSubmit}>
            <input onChange={handleChange} name="composedMessage" type="text" autoComplete="off"/>
            <button>Send</button>
          </form>
        </div>
      </div>
  )
}

export default ChatBox;