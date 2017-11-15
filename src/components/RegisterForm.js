import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Alert from './Alert';

export default class RegisterForm extends Component {
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

    this.props.userRegistration({ username, password });
  }

  render() {
    return (
      <div className="chatapp__form--container">
        <div className="chatapp__form--modal">
          <form onSubmit={this.handleSubmit}>
            <input onChange={this.handleChange} name="username" type="text" label="Username" placeholder="&#xf2c0; Enter a Username"/>
            <input onChange={this.handleChange} name="password" type="password" label="Password" placeholder="&#xf13e; Enter a password"/>
            {
              (this.props.registrationError.length)
                ? <Alert 
                    header="Something went wrong"
                    content={`${this.props.registrationError[this.props.registrationError.length - 1].response.data.error}`}
                  />
                : null
            }
            <button>Register</button>
          </form>
        </div>
      </div>
    )
  }
}

RegisterForm.propTypes = {
  username: PropTypes.string,
  password: PropTypes.string,
}