import { ServerStateState } from '../../store/serverState/reducer';
import { ConnectedReduxProps, ApplicationState } from '../../store';
import React from 'react';
import { connect } from 'react-redux';
import { Grid, Segment } from 'semantic-ui-react';
import style from './style.module.scss';

type Props = ServerStateState & ConnectedReduxProps;

class ServerDescription extends React.Component<Props> {
  render() {
    const networkInterfaceUpdatingElement = (
      <span>configuring...</span>
    );
    const networkInterfaceStableElement = (
      <span>configured</span>
    );
    return (
      <Segment inverted loading={this.props.isLoading}>
        <Grid>
          <Grid.Column width={4}>
            <span className={style.prefix}>Server: </span>
            <strong>{this.props.ssid}</strong>
          </Grid.Column>
          <Grid.Column width={4}>
            <span className={style.prefix}>Mode: </span>
            <strong>{this.props.nodeStatus ? this.props.nodeStatus.mode : '...'}</strong>
          </Grid.Column>
          <Grid.Column width={4}>
            <span className={style.prefix}>Network interface: </span>
            <strong>{this.props.nodeStatus && this.props.nodeStatus.isNetworkInterfaceUpdating ? networkInterfaceUpdatingElement : networkInterfaceStableElement}</strong>
          </Grid.Column>
          <Grid.Column width={4}>
            <span className={style.prefix}>Master visible: </span>
            <strong>{this.props.nodeStatus && this.props.nodeStatus.isMasterVisible ? 'yes' : 'no'}</strong>
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