import React from 'react';
import { connect } from 'react-redux';
import { Grid, Button, ButtonProps } from 'semantic-ui-react';
import style from './style.module.scss';
import { ApplicationState, ConnectedReduxProps } from '../../store';
import { RotaryEncoderState } from '../../store/rotaryEncoder/reducer';
import { press } from '../../store/rotaryEncoder/actions';

type Props = RotaryEncoderState & ConnectedReduxProps;

class RotaryEncoderControls extends React.Component<Props> {
  render() {

    const { dispatch, isPressed } = this.props;

    const buttonProps: ButtonProps = {
      size: 'massive',
      circular: true,
      fluid: true,
    };
    const pushProps: ButtonProps = Object.assign({}, buttonProps, {
      color: isPressed ? 'pink' : 'blue',
    });

    return (
      <div className={style.root}>
        <Grid columns={3} relaxed>
          <Grid.Column>
            <Button {...buttonProps}>
              LEFT
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button {...buttonProps}>
              RIGHT
            </Button>
          </Grid.Column>
          <Grid.Column>
            <Button {...pushProps} onClick={() => dispatch(press())}>
              { isPressed ? 'RELEASE' : 'PUSH' }
            </Button>
          </Grid.Column>
        </Grid>
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return state.rotaryEncoder;
};

export default connect(mapStateToProps)(RotaryEncoderControls);