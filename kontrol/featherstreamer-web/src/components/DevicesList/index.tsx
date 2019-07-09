import React from 'react';
import { ApplicationState, ConnectedReduxProps } from '../../store';
import { ServerStateState } from '../../store/serverState/reducer';
import { connect } from 'react-redux';
import { Button, Icon, Table, StrictDropdownItemProps, StrictDropdownProps, InputOnChangeData } from 'semantic-ui-react';
import { forgetDevice, setDeviceChannel, setDeviceBrightness, setDeviceColor } from '../../store/serverState/actions';
import style from './style.module.scss';
import { Select, Input } from 'semantic-ui-react';
import { Channel } from 'featherstreamer-shared';
import { SketchPicker, ColorResult } from 'react-color';

const deepEqual = require('deep-equal');

type Props = ServerStateState & ConnectedReduxProps;

interface DeviceProps {
  id: string,
  connections: number,

  // Selected channel ID.
  channelId: string,

  brightness: number,

  // All available channel IDs.
  channels: {[id: string]: Channel},

  dispatch: ConnectedReduxProps['dispatch'],
}

interface DeviceState {
  displayColorPicker: boolean;
  color?: ColorResult;
}

class Device extends React.Component<DeviceProps, DeviceState> {
  constructor(props: DeviceProps) {
    super(props);

    this.state = {
      displayColorPicker: false,
    };
  }

  onClickDelete() {
    if (window.confirm(`Forget device ${this.props.id} on channel ${this.props.channelId}?`)) {
      this.props.dispatch(forgetDevice(this.props.id));
    }
  }

  handleChannelChanged(value: StrictDropdownProps) {
    this.props.dispatch(setDeviceChannel({ deviceId: this.props.id, channelId: value.value }));
  }

  handleBrightnessChanged(value: InputOnChangeData) {
    this.props.dispatch(setDeviceBrightness({ deviceId: this.props.id, brightness: parseFloat(value.value) }));
  }

  handleColorPickerToggled() {
    this.setState({ displayColorPicker: !this.state.displayColorPicker });
  }

  handleColorChanged(color: ColorResult) {
    this.props.dispatch(setDeviceColor({ deviceId: this.props.id, color: color.rgb }));
    this.setState({ color });
    return true;
  }

  shouldComponentUpdate(nextProps: DeviceProps, nextState: DeviceState) {
    // Re-rendering can mess with the select box's state during
    // e.g. searches, so only do it if properties have actually
    // changed.
    return !deepEqual(this.props, nextProps, { strict: true }) ||
           !deepEqual(this.state, nextState, { strict: true});
  }

  render() {
    const deleteElement =
      (this.props.connections <= 0) ?
      (<Icon className={style.delete} name="delete" link color="red" onClick={() => this.onClickDelete()} />) :
      (<div />);

    const channelIds = Object.keys(this.props.channels).sort();

    let selectedValue: string|undefined = undefined;
    const channelSelectOpts: StrictDropdownItemProps[] = channelIds.map((c) => {
      const val = { value: c, text: this.props.channels[c].description };
      if (c === this.props.channelId) {
        selectedValue = c;
      }
      return val;
    });
    if (!(this.props.channelId in this.props.channels)) {
      const val = { value: this.props.channelId, text: this.props.channelId };
      channelSelectOpts.unshift(val);
      selectedValue = val.value;
    }

    const isColorPickerActive: boolean = this.props.connections > 0;

    const renderedColorPicker = this.state.displayColorPicker ? (
      <div className={style.popover}>
        <div className={style.cover} onClick={() => this.handleColorPickerToggled()} />
        <SketchPicker disableAlpha color={this.state.color ? this.state.color.rgb : undefined} onChangeComplete={((color) => this.handleColorChanged(color))} />
      </div>
    ) : '';

    const renderedColorIcon = this.state.color ? (
      <Icon
        className={style.splotchIcon}
        name="circle"
        style={{color: this.state.color.hex}} />
    ) : undefined;

    return (
      <Table.Row>
        <Table.Cell width={5}>
          {this.props.id}
          {deleteElement}
        </Table.Cell>
        <Table.Cell width={5}>
          <Select
            fluid search
            options={channelSelectOpts}
            defaultValue={selectedValue}
            onChange={(event, data) => this.handleChannelChanged(data)}
            className={style.input}
          />
        </Table.Cell>
        <Table.Cell width={3}>
          <Input
            fluid type="number"
            defaultValue={this.props.brightness}
            className={style.input}
            min={0} max={1} step={0.05}
            onChange={(event, data) => this.handleBrightnessChanged(data)}
          />
        </Table.Cell>
        <Table.Cell width={5}>
          <div className={style.splotchControlWrapper}>
            <Button
              disabled={!isColorPickerActive}
              icon={renderedColorIcon ? true : false}
              color="grey"
              labelPosition={renderedColorIcon ? 'right' : undefined}
              onClick={() => isColorPickerActive ? this.handleColorPickerToggled() : undefined}
            >
              { renderedColorIcon }
              Pick
            </Button>
            {/* { renderedColorSplotch } */}
            { renderedColorPicker }
          </div>
        </Table.Cell>
        <Table.Cell width={3}>{this.props.connections}</Table.Cell>
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
            <Table.HeaderCell>Brightness</Table.HeaderCell>
            <Table.HeaderCell>Offline Color</Table.HeaderCell>
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