import React, { Component } from 'react';

export default class LoginForm extends Component {
  render() {
    return (
      <div>
        LOGIN FORM
        <form>
          <input type="text" label="Username" placeholder="Enter your Username"/>
          <input type="password" label="Password" placeholder="Enter your Password"/>
          <button>Login</button>
        </form>
      </div>
    )
  }
}