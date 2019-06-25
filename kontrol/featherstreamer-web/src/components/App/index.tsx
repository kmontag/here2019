import React from 'react';
import RotaryEncoderControls from '../RotaryEncoderControls';
import { connect } from 'react-redux';
import styles from './style.module.scss';
import { Grid } from 'semantic-ui-react';

class App extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        <Grid container columns={1}>
          <Grid.Row>
            <Grid.Column>
              <RotaryEncoderControls />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default connect()(App);
