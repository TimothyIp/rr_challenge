import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
import Navigation from './components/Navigation';
import ChatUI from './components/ChatUI';

class App extends Component {
  render() {
    return (
      <div>
        <Navigation />
        Main page
        <ChatUI />
      </div>
    );
  }
}

export default App;
