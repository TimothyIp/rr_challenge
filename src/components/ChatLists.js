import React, { Component } from 'react';
import Moment from 'moment';
import AddChannelBtn from './AddChannelBtn';

export default class ChatLists extends Component {
  constructor() {
     super();
  }

  componentDidMount() {

    // Gets most recent conversations
    this.props.getUsersConversations();
  }

  render() {
    const messageList = {
      backgroundColor: "#eee",
      width: "50%"
    }
  
    const { conversations, usersChannels, handleChange, handleSubmit, createChannel, removeChannel } = this.props;
  
    return (
      <div style={messageList}>
        <h3>User Panel</h3>
        <div style={messageList}>
        <div>
          <p>Channels</p>
          <AddChannelBtn 
            handleChange={handleChange}
            handleSubmit={handleSubmit}
            createChannel={createChannel}
            removeChannel={removeChannel}
          />
          {
            (usersChannels)
              ? <ul> 
                  {usersChannels.map((channel, index) => {
                    return(
                      <li key={`usersChannelId-${index}`}>
                        <p>{channel}</p>
                        {
                          (channel !== "Public-Main")
                            ? <button>Remove</button>
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
          {
              (conversations)
                ? <ul>
                    {conversations.map((conversation, index) => {
                      return(
                        <li key={`convoId-${index}`}>
                          <p>{conversation[0].body}</p>
                          <p>{conversation[0].author.username}</p>
                          <p>{Moment(conversation[0].createdAt).fromNow()}</p>
                          <p>Posted in {conversation[0].channelName || "Private Message"}</p>
                        </li>
                      )
                    })}
                  </ul>
                : <p>No Active Conversations</p>
            }
        </div>
        </div>
      </div>
    )
  }
}
