import React, { Component } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Alert from './Alert';

const API_URL = 'http://localhost:3000/api';
const cookies = new Cookies();

export default class LoginForm extends Component {
  constructor(){
    super();

    this.state = {
      username: "",
      password: "",
    }
  }

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();

    const { username, password } = this.state;

    this.props.userLogin({ username, password });

  }


  render() {
    return (
      <div>
        LOGIN FORM
        <button onClick={this.props.closeForm}>Close</button>
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.handleChange} name="username" type="text" label="Username" placeholder="Enter your Username"/>
          <input onChange={this.handleChange} name="password" type="password" label="Password" placeholder="Enter your Password"/>
          {
            (this.props.loginError.length)
              ? <Alert 
                  header="Login Error has happened"
                  content="Must enter a valid Username or password."
                />
              : null
          }
          <button>Login</button>
        </form>
      </div>
    )
  }
}