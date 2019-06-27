import { ServerStateState } from '../../store/serverState/reducer';
import { ConnectedReduxProps, ApplicationState } from '../../store';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Segment } from 'semantic-ui-react';
import style from './style.module.scss';

type Props = ServerStateState & ConnectedReduxProps;

class ServerDescription extends React.Component<Props> {
  render() {
    return (
      <Segment inverted loading={this.props.isLoading}>
        <Grid>
          <Grid.Column>
            <span className={style.prefix}>Server: </span>
            <strong>{this.props.ssid}</strong>
          </Grid.Column>
        </Grid>
      </Segment>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return state.serverState;
};

export default connect(mapStateToProps)(ServerDescription);