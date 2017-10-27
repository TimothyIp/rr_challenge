import React from 'react';

const Navigation = (props) => {
  const { displayForms, id, userLogout, username, guestUsername } = props;

  return (
    <div>
      <div>
        Chat Navigation {
          (username)
            ? <span>Logged in as {username}</span>
            : null
        }
        {
          (guestUsername)
            ? <span>Logged in as Guest-{guestUsername}</span>
            : null
        }
      </div>
      {
        (id)
          ? <button onClick={userLogout}>Logout</button>
          : <div>
            <button onClick={() => {displayForms("login")}}>Login</button>
            <button onClick={() => {displayForms("register")}}>Sign Up</button>
            </div>
      }
    </div>
  )
}

export default Navigation;