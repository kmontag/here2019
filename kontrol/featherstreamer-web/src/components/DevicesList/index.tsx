import React from 'react';
import { ApplicationState, ConnectedReduxProps } from '../../store';
import { ServerStateState } from '../../store/serverState/reducer';
import { connect } from 'react-redux';
import { Icon, Table } from 'semantic-ui-react';
import { forgetDevice } from '../../store/serverState/actions';

type Props = ServerStateState & ConnectedReduxProps;

interface DeviceProps {
  id: string,
  connections: number,
  channelId: string,
  dispatch: ConnectedReduxProps['dispatch'],
};

class Device extends React.Component<DeviceProps> {
  onClickDelete() {
    if (window.confirm(`Forget device ${this.props.id} on channel ${this.props.channelId}?`)) {
      this.props.dispatch(forgetDevice(this.props.id));
    }
  }

  render() {
    const deleteCell =
      (this.props.connections <= 0) ?
      (<Icon name="delete" link color="red" onClick={() => this.onClickDelete()} />) :
      (<div />);

    return (
      <Table.Row>
        <Table.Cell width={5}>{this.props.id}</Table.Cell>
        <Table.Cell width={5}>{this.props.channelId}</Table.Cell>
        <Table.Cell width={5}>{this.props.connections}</Table.Cell>
        <Table.Cell width={1}>{deleteCell}</Table.Cell>
      </Table.Row>
    );
  }
}

class DevicesList extends React.Component<Props> {
  render() {
    const devices = [];
    for (const id in this.props.devices) {
      devices.push(
        <Device key={id} id={id} {...this.props.devices[id]} dispatch={this.props.dispatch} />
      );
    }
    devices.sort((a, b) => a.props.id.localeCompare(b.props.id));

    return (
      <Table padded size="large">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>Device</Table.HeaderCell>
            <Table.HeaderCell>Channel</Table.HeaderCell>
            <Table.HeaderCell>Connections</Table.HeaderCell>
            <Table.HeaderCell></Table.HeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {devices}
        </Table.Body>
      </Table>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return state.serverState;
};

export default connect(mapStateToProps)(DevicesList);