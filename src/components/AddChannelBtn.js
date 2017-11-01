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
      <div className="channel__add--popup">
        {
          (this.state.showMenu)
            ? <div className="channel__search">
                <form onSubmit={createChannel} >
                  <input onChange={handleChange} type="text" name="createInput" placeholder="&#xf002; Channel name" required/>
                </form>
                <button className="close__btn" onClick={this.closeMenu}>&#xf057;</button>
              </div>
            : <button className="add__btn" onClick={this.handleClick}>&#xf055;</button>
        }
      </div>
    )
  }
}