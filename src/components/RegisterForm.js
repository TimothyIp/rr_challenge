import React, { Component } from 'react';
import axios from 'axios';
import Cookies from 'universal-cookie';
import Alert from './Alert';

const API_URL = 'http://localhost:3000/api';
const cookies = new Cookies();


export default class RegisterForm extends Component {
  constructor(){
    super();

    this.state = {
      username: "",
      password: "",
      registrationError: []
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

    axios.post(`${API_URL}/auth/register`, { username, password })
      .then(res => {
        console.log(res);
        cookies.set('token', res.data.token, { path: "/" });
        cookies.set('user', res.data.user, { path: "/" });
        this.setState({
          registrationError:[]
        })
      })
      .catch(error => {
        // Always show most recent errors
        const errorLog = Array.from(this.state.registrationError);

        errorLog.length = [];
        errorLog.push(error);

        this.setState({
          registrationError: errorLog
        })
      })
  }

  render() {
    return (
      <div>
        REGISTER FORM
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.handleChange} name="username" type="text" label="Username" placeholder="Enter a Username"/>
          <input onChange={this.handleChange} name="password" type="password" label="Password" placeholder="Enter a password"/>
          {
            (this.state.registrationError.length)
              ? <Alert 
                  header="Something went wrong"
                  content={`${this.state.registrationError[0].response.data.error}`}
                />
              : null
          }
          <button>Register</button>
        </form>
      </div>
    )
  }
}