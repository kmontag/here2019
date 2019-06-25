import React from 'react';
import { connect } from 'react-redux';
import styles from './style.module.scss';

class App extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        <header className="App-header">
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React?
          </a>
        </header>
      </div>
    );
  }
}

export default connect()(App);
