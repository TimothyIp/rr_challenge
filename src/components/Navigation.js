import React from 'react';

const Navigation = (props) => {
  const { displayForms, id, userLogout, username, guestUsername, closeForm } = props;

  return (
    <div className="chatapp__navigation--container">
      <div className="chatapp__navigation--logo" onClick={() => {if(!username){closeForm()}}}>
          Live Chat
      </div>
      <div className="chatapp__navigation--user">
            {
              (username)
                ? <span>{username}</span>
                : null
            }
            {
              (guestUsername)
                ? <span>Guest-{guestUsername}</span>
                : null
            }
            {
              (id)
                ? <button onClick={userLogout}>Logout</button>
                : <div>
                  <button onClick={() => {displayForms("login")}}>Login</button>
                  <button onClick={() => {displayForms("register")}}>Sign Up</button>
                  </div>
            }
      </div>
    </div>
  )
}

export default Navigation;