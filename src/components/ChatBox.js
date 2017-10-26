import React from 'react';

const ChatBox = () => {
  const messageBox = {
    width: "720px",
    height: "590px",
    border: "1px solid black"
  }

  return (
    <div>
      <div style={messageBox}></div>
      <input type="text" autocomplete="off"/>
      <button>Send</button>
    </div>
  )
}

export default ChatBox;