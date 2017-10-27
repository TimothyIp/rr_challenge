import React from 'react';
import Alert from './Alert';

const ChatSelector = (props) => {
  const { handleChange, guestLogin, loginError } = props;
  return (
    <div>
      <h3>Chat Selector Component</h3> 
      <p>You can either login, register or enter as a guest</p> 
      <p>*guests cannot change channels or private message other users</p>
      <form onSubmit={guestLogin}>
        <input onChange={handleChange} type="text" name="guestSignup" placeholder="Enter a Guest Name" label="Enter a Guest Name"/>
        <button>Enter</button>
      </form>
      {
        (loginError.length)
          ? <Alert 
              header="Login Error"
              content={loginError[0].response.data.error}
            />
          :null
      }
    </div>
  )
}

export default ChatSelector;