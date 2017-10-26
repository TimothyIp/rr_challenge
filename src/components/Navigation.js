import React, { Component } from 'react';

const Navigation = (props) => {
  const { displayForms, id, userLogout, username } = props;

  return (
    <div>
      <div>
        Chat Navigation - Logged in as {username}
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