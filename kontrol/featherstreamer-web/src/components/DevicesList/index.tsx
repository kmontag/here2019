import React from 'react';
import { ApplicationState, ConnectedReduxProps } from '../../store';
import { ServerStateState } from '../../store/serverState/reducer';
import { connect } from 'react-redux';
import { Button, Icon, Grid, Table, StrictDropdownItemProps, StrictDropdownProps, InputOnChangeData } from 'semantic-ui-react';
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
  displayColorPicker: boolean[]
  colors: (ColorResult|undefined)[];
}

// More convenient than defining a constant for the count.
const COLOR_INDICES = [0, 1, 2];

class Device extends React.Component<DeviceProps, DeviceState> {
  constructor(props: DeviceProps) {
    super(props);

    this.state = {
      displayColorPicker: COLOR_INDICES.map((i) => false),
      colors: COLOR_INDICES.map((i) => undefined),
    }
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
    this.props.dispatch(setDeviceBrightness({ deviceId: this.props.id, brightness: parseFloat(value.value) || 0 }));
  }

  handleColorPickerToggled(index: number) {
    const colorPickerCopy: boolean[] = this.state.displayColorPicker.slice(0);
    colorPickerCopy[index] = !colorPickerCopy[index];
    this.setState({ displayColorPicker: colorPickerCopy });
  }

  handleColorChanged(index: number, color: ColorResult) {
    const colorsCopy = this.state.colors.slice(0);
    colorsCopy[index] = color;
    this.props.dispatch(setDeviceColor({ deviceId: this.props.id, index: index, color: color.rgb }));
    this.setState({ colors: colorsCopy });
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

    const renderedColorPickers = COLOR_INDICES.map((colorIndex) => {
      const color = this.state.colors[colorIndex];
      return this.state.displayColorPicker[colorIndex] ? (
        <div key={colorIndex} className={style.popover}>
          <div className={style.cover} onClick={() => this.handleColorPickerToggled(colorIndex)} />
          <SketchPicker disableAlpha color={color ? color.rgb : undefined} onChangeComplete={((newColor) => this.handleColorChanged(colorIndex, newColor))} />
        </div>
      ) : '';
    });

    const renderedColorIcons = COLOR_INDICES.map((colorIndex) => {
      const color = this.state.colors[colorIndex];
      return color ? (
        <Icon
          key={colorIndex}
          className={style.splotchIcon}
          name="circle"
          style={{color: color.hex}} />
      ) : undefined;
    });

    const colorPickerButtons = COLOR_INDICES.map((colorIndex) => {
      return (
        <Grid.Column key={colorIndex}>
          <div className={style.splotchControlWrapper}>
            <Button
              disabled={!isColorPickerActive}
              icon={renderedColorIcons[colorIndex] ? true : false}
              color="grey"
              labelPosition={renderedColorIcons[colorIndex] ? 'right' : undefined}
              onClick={() => isColorPickerActive ? this.handleColorPickerToggled(colorIndex) : undefined}
            >
              { renderedColorIcons[colorIndex] }
              Pick
            </Button>
            { renderedColorPickers[colorIndex] }
          </div>
        </Grid.Column>
      );
    });

    return (
      <Table.Row>
        <Table.Cell width={4}>
          {this.props.id}
          {deleteElement}
        </Table.Cell>
        <Table.Cell width={4}>
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
        <Table.Cell width={10}>
          <Grid columns={3}>
            <Grid.Row>
              {colorPickerButtons}
            </Grid.Row>
          </Grid>
        </Table.Cell>
        <Table.Cell width={2}>{this.props.connections}</Table.Cell>
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
            <Table.HeaderCell>Offline Colors</Table.HeaderCell>
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