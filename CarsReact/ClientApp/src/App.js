import React, { Component } from 'react';
import { Route } from 'react-router';
import { UsersList } from './components/UsersList';

export default class App extends Component {
  displayName = App.name

  render() {
    return (        
        <Route exact path='/' component={UsersList} />
    );
  }
}
