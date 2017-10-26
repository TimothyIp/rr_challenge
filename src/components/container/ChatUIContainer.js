import React, { Component } from 'react';
import LoginForm from '../LoginForm';
import RegisterForm from '../RegisterForm';

export default class ChatUIContainer extends Component {
  constructor(){
    super();
  }

  componentDidMount() {

  }

  render() {
    return (
      <div>
        <LoginForm />
        <RegisterForm />
        <div>Chat Room Appears</div>
      </div>
    )
  }
}