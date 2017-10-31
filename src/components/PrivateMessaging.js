import React from 'react';
import Moment from 'moment';

const PrivateMessaging = (props) => {
  const { handlePrivateInput, handlePrivateSubmit, closePM, currentPrivateRecipient, privateMessageLog, socketPMs } = props;

  return (
    <div>
      <h3>Private Messaging Window</h3>
      <p>Conversation with {currentPrivateRecipient.username}</p>
      <button onClick={() => {closePM()}}>Close</button>
      <p>User's Private Messages</p>
      {
        (privateMessageLog.length)
          ? <ul>
                {privateMessageLog.map((message, index) => {
                  return (
                    <li key={`chatMsgId-${index}`}>
                      <p>{message.body}</p>
                      <p>Posted by: {message.author[0].item.username}</p>
                      <p>Sent at: {Moment(message.createdAt).fromNow()}</p>
                    </li>
                  )
                })}
            </ul>
          : <div>No current chat. Send them a message!</div>
      }
      {
        (socketPMs.length)
          ? <ul>
              {socketPMs.map((message, index) => {
                return (
                  <li key={`socketPMsId-${index}`}>
                    <p>{message.body}</p>
                    <p>Posted by: {message.author[0].item.username}</p>
                    <p>Sent at: {Moment(message.createdAt).fromNow()}</p>
                  </li>
                )
              })}
            </ul>
          : null
      }
      <form onSubmit={handlePrivateSubmit}>
        <input onChange={handlePrivateInput} name="privateMessageInput" type="text" placeholder="Write a message" autoComplete="off" />
        <button>Send</button>
      </form>
    </div>
  )
}

export default PrivateMessaging;
