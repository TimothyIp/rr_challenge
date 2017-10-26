import React, { Component } from 'react';
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
      <div>
        REGISTER FORM
        <button onClick={this.props.closeForm}>Close</button>
        <form onSubmit={this.handleSubmit}>
          <input onChange={this.handleChange} name="username" type="text" label="Username" placeholder="Enter a Username"/>
          <input onChange={this.handleChange} name="password" type="password" label="Password" placeholder="Enter a password"/>
          {
            (this.props.registrationError.length)
              ? <Alert 
                  header="Something went wrong"
                  content={`${this.props.registrationError[0].response.data.error}`}
                />
              : null
          }
          <button>Register</button>
        </form>
      </div>
    )
  }
}