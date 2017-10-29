import React, { Component } from 'react';

export default class AddChannelBtn extends Component {

state = { showMenu: false };

handleClick = () => {
  this.setState(prevState => ({
    showMenu: !prevState.showMenu
  })
)}

closeMenu = () => {
  this.setState({
    showMenu: false
  })
}

  render() {
    const { handleChange, createChannel } = this.props;

    return (
      <div>
        {
          (this.state.showMenu)
            ? <div>
              <form onSubmit={createChannel} >
                <input onChange={handleChange} type="text" name="createInput" placeholder="Enter a channel name"/>
                <button type="submit">Join</button>
              </form>
              <button onClick={this.closeMenu}>Close</button>
              </div>
            : <button onClick={this.handleClick}>Add</button>
        }

      </div>
    )
  }
}