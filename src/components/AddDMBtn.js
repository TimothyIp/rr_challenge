import React, { Component } from 'react';
import Alert from './Alert';

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
    const { handleChange, startConversation, directMessageErrorLog } = this.props;

    return (
      <div className="channel__add--popup">
        {
          (this.state.showMenu)
            ? <div>
              {
                (directMessageErrorLog.length)
                  ? <Alert 
                      header="Private Message Error"
                      content={directMessageErrorLog[directMessageErrorLog.length - 1].response.data.error}
                    />
                  : null
              }
              <div className="channel__search">
                <form onSubmit={startConversation}>
                  <input onChange={handleChange} type="text" name="startDmInput" placeholder="&#xf002; Recipient name"/>
                </form>
                <button className="close__btn" onClick={this.closeMenu}>&#xf057;</button>
              </div>
              </div>
            : <button className="add__btn" onClick={this.handleClick}>&#xf055;</button>
        }
      </div>
    )
  }
}