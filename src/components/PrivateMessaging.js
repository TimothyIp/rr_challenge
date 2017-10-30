import React from 'react';

const PrivateMessaging = (props) => {
  const { handlePrivateInput, handlePrivateSubmit, closePM, currentPrivateRecipient } = props;

  return (
    <div>
      <h3>Private Messaging Window</h3>
      <p>Conversation with {currentPrivateRecipient.username}</p>
      <button onClick={() => {closePM()}}>Close</button>
      <p>User's Private Messages</p>
      <form onSubmit={handlePrivateSubmit}>
        <input onChange={handlePrivateInput} name="privateMessageInput" type="text" placeholder="Write a message" autoComplete="off" />
        <button>Send</button>
      </form>
    </div>
  )
}

export default PrivateMessaging;