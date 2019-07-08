import React from 'react';
import { ApplicationState, ConnectedReduxProps } from '../../store';
import { ServerStateState } from '../../store/serverState/reducer';
import { connect } from 'react-redux';
import { Icon, Table } from 'semantic-ui-react';
import { forgetDevice, setDeviceChannel } from '../../store/serverState/actions';
import style from './style.module.scss';
import Select from 'react-select';
import { Channel } from 'featherstreamer-shared';
import { ValueType } from 'react-select/src/types';

type Props = ServerStateState & ConnectedReduxProps;

interface DeviceProps {
  id: string,
  connections: number,

  // Selected channel ID.
  channelId: string,

  // All available channel IDs.
  channels: {[id: string]: Channel},

  dispatch: ConnectedReduxProps['dispatch'],
};

interface SelectOption {
  value: string;
  label: string;
}

class Device extends React.Component<DeviceProps> {
  onClickDelete() {
    if (window.confirm(`Forget device ${this.props.id} on channel ${this.props.channelId}?`)) {
      this.props.dispatch(forgetDevice(this.props.id));
    }
  }

  handleSelectChanged(value: ValueType<SelectOption>) {
    if (value) {
      if (Array.isArray(value)) {
        throw new Error('unexpected');
      }
      this.props.dispatch(setDeviceChannel({ deviceId: this.props.id, channelId: (value as SelectOption).value }));
    }
  }

  render() {
    const deleteElement =
      (this.props.connections <= 0) ?
      (<Icon className={style.delete} name="delete" link color="red" onClick={() => this.onClickDelete()} />) :
      (<div />);

    const channelIds = Object.keys(this.props.channels).sort();

    let selectedValue: SelectOption|undefined = undefined;
    const channelSelectOpts: SelectOption[] = channelIds.map((c) => {
      const val = { value: c, label: this.props.channels[c].description };
      if (c === this.props.channelId) {
        selectedValue = val;
      }
      return val;
    });
    if (!(this.props.channelId in this.props.channels)) {
      const val = { value: this.props.channelId, label: this.props.channelId };
      channelSelectOpts.unshift(val);
      selectedValue = val;
    }

    return (
      <Table.Row>
        <Table.Cell width={5}>
          {this.props.id}
          {deleteElement}
        </Table.Cell>
        <Table.Cell width={5}>
          <Select options={channelSelectOpts} defaultValue={selectedValue} onChange={(value: ValueType<SelectOption>) => this.handleSelectChanged(value) } />
        </Table.Cell>
        <Table.Cell width={5}>{this.props.connections}</Table.Cell>
      </Table.Row>
    );
  }
}

class DevicesList extends React.Component<Props> {
  render() {
    const devices = [];
    for (const id in this.props.devices) {
      devices.push(
        <Device key={id} id={id} channels={this.props.channels} {...this.props.devices[id]} dispatch={this.props.dispatch} />
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