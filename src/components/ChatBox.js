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

  const { handleSubmit, handleChange, currentChannel, conversations, id } = props;

  return (
      <div style={layoutContainer}>
        {
          (id)
          ? <ChatLists 
              {...props}
              />
            : null
        }
        <div style={chatBox}>
          <h3>Current Channel: {currentChannel}</h3>
          <div style={messageBox}></div>
          <form onSubmit={handleSubmit}>
            <input onChange={handleChange} name="composedMessage" type="text" autoComplete="off"/>
            <button>Send</button>
          </form>
        </div>
      </div>
  )
}

export default ChatBox;