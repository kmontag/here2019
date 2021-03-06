import React from 'react';
import RotaryEncoderControls from '../RotaryEncoderControls';
import ServerDescription from '../ServerDescription';
import DevicesList from '../DevicesList';
import Media from '../Media';
import styles from './style.module.scss';
import { Grid } from 'semantic-ui-react';

class App extends React.Component {
  render() {
    return (
      <div className={styles.root}>
        <Grid container columns={1}>
          <Grid.Row>
            <Grid.Column>
              <ServerDescription />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <RotaryEncoderControls />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <Media />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <Grid.Column>
              <DevicesList />
            </Grid.Column>
          </Grid.Row>
        </Grid>
      </div>
    );
  }
}

export default App;
