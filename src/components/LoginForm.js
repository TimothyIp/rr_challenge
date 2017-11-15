import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';



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
    const { username, password } = this.state;
    e.preventDefault();

    this.props.userLogin({ username, password });
  }


  render() {
    return (
      <div className="chatapp__form--container">
        <div className="chatapp__form--modal">
            <form onSubmit={this.handleSubmit}>
              <input onChange={this.handleChange} name="username" type="text" label="Username" placeholder="&#xf2c0; Username"/>
              <input onChange={this.handleChange} name="password" type="password" label="Password" placeholder="&#xf13e;  Password"/>
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
      </div>
    )
  }
}

LoginForm.propTypes = {
  username: PropTypes.string,
  password: PropTypes.string,
}