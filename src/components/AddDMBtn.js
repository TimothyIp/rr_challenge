import React, { Component } from 'react';

export default class AddDMBtn extends Component {

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
    const { handleChange, startConversation } = this.props;

    return (
      <div>
        {
          (this.state.showMenu)
            ? <div>
              <form onSubmit={startConversation}>
                <input onChange={handleChange} type="text" name="startDmInput" placeholder="Enter a recipient name"/>
                <button type="submit">Start</button>
              </form>
              <button onClick={this.closeMenu}>Close</button>
              </div>
            : <button onClick={this.handleClick}>Add</button>
        }
      </div>
    )
  }
}