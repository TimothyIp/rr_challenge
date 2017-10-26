import React from 'react';

const ChatBox = (props) => {
  const messageBox = {
    width: "720px",
    height: "590px",
    border: "1px solid black",
    overflow: "scroll"
  }

  const { handleSubmit, handleChange, currentChannel, conversations } = props;

  return (
    <div>
      <h3>Current Channel: {currentChannel}</h3>
      <div style={messageBox}>
        {
          (conversations.length)
            ? <ul>
                {conversations.map((conversation, index) => {
                  return(
                    <li key={`convoId-${index}`}>
                      <p>{conversation[0].body}</p>
                      <p>{conversation[0].author.username}</p>
                      <p>{conversation[0].createdAt}</p>
                    </li>
                  )
                })}
              </ul>
            : <p>No Conversations</p>
        }
      </div>
      <form onSubmit={handleSubmit}>
        <input onChange={handleChange} name="composedMessage" type="text" autoComplete="off"/>
        <button>Send</button>
      </form>
    </div>
  )
}

export default ChatBox;