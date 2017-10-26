import React from 'react';

const ChatBox = (props) => {
  const messageBox = {
    width: "720px",
    height: "590px",
    border: "1px solid black"
  }

  const { handleSubmit, handleChange, currentChannel } = props;

  return (
    <div>
      <h3>Current Channel: {currentChannel}</h3>
      <div style={messageBox}></div>
      <form onSubmit={handleSubmit}>
        <input onChange={handleChange} name="composedMessage" type="text" autoComplete="off"/>
        <button>Send</button>
      </form>
    </div>
  )
}

export default ChatBox;