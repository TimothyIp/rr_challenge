import React, { Component } from 'react';
import AddChannelBtn from './AddChannelBtn';
import AddDMBtn from './AddDMBtn';

export default class ChatLists extends Component {
  constructor() {
     super();
  }

  componentDidMount() {
    // Gets most recent conversations
    this.props.getUsersConversations();
  }

  render() {
    const { usersChannels, handleChange, handleSubmit, createChannel, removeChannel, joinChannel, usersDirectMessages, leaveConversation, choosePrivateMessageRecipient } = this.props;
  
    return (
      <div className="chatapp__userpanel--container">
        <h3>User Panel</h3>
        <div>
          <p>Channels</p>
          <AddChannelBtn 
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            createChannel={createChannel}
          />
          {
            (usersChannels)
              ? <ul> 
                  {usersChannels.map((channel, index) => {
                    return(
                      <li key={`usersChannelId-${index}`}>
                        <div onClick={() => {joinChannel(channel)}}>{channel}</div>
                        {
                          (channel !== "Public-Main")
                            ? <button onClick={() => {removeChannel(channel)}}>Remove</button>
                            : null
                        }
                      </li>
                    )
                  })}
                </ul>
              : null
          }
        </div>
        <div>
          <p>Private Messages</p>
          <AddDMBtn 
          {...this.props}
          />
          {
              (usersDirectMessages)
                ? <ul>
                    {usersDirectMessages.map((conversation, index) => {
                      return(
                        <li key={`convoId-${index}`}>
                          <div>
                            <p onClick={() => { choosePrivateMessageRecipient(conversation) }}>
                              {conversation.username}
                            </p>
                            <button onClick={() => {leaveConversation(conversation._id, conversation.username)}}>X</button>
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                : <p>No Active Conversations</p>
            }
        </div>
      </div>
    )
  }
}