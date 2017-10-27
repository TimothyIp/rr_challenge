import React, { Component } from 'react';
import Moment from 'moment';

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
  
    const { conversations } = this.props;
  
    return (
      <div style={messageList}>
        <h3>Current Conversations</h3>
        <div style={messageList}>
        {
            (conversations.length)
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
    )
  }
}
