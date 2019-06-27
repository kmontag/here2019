import React from 'react';
import { connect } from 'react-redux';
import { Grid, Button, ButtonProps } from 'semantic-ui-react';
import style from './style.module.scss';
import { ApplicationState, ConnectedReduxProps } from '../../store';
import { RotaryEncoderState } from '../../store/rotaryEncoder/reducer';
import { press, release, rotateClockwise, rotateCounterclockwise } from '../../store/rotaryEncoder/actions';
import knob from './knob.svg';

type Props = RotaryEncoderState & ConnectedReduxProps;

class RotaryEncoderControls extends React.Component<Props> {

  render() {
    const { dispatch, isPressed } = this.props;

    const maxPosition = 8;
    let position: number = this.props.position;
    if (position < 0) {
      position += maxPosition * (Math.ceil(-position / maxPosition));
    }
    position = position % maxPosition;

    const buttonProps: ButtonProps = {
      size: 'massive',
      circular: true,
      fluid: true,
    };
    const pushProps: ButtonProps = Object.assign({}, buttonProps, {
      color: isPressed ? 'pink' : 'blue',
    });
    const knobProps: ButtonProps = Object.assign({}, buttonProps, {
      color: 'white',
      inverted: isPressed,
    });

    return (
      <div className={style.root}>
        <Grid relaxed>
          <Grid.Column width={5}>
            <Button {...buttonProps}
              onClick={() => dispatch(rotateCounterclockwise())}
            >
              LEFT
            </Button>
          </Grid.Column>
          <Grid.Column width={5}>
            <Button {...buttonProps}
              onClick={() => dispatch(rotateClockwise())}
            >
              RIGHT
            </Button>
          </Grid.Column>
          <Grid.Column width={6}>
            <Grid>
              <Grid.Column width={11}>
                <Button {...pushProps}
                  onMouseDown={() => dispatch(press())}
                  onMouseUp={() => dispatch(release())}>
                  { isPressed ? 'RELEASE' : 'PUSH' }
                </Button>
              </Grid.Column>
              <Grid.Column width={5}>
                <Button {...knobProps}
                  onMouseDown={() => dispatch(press())}
                  onMouseUp={() => dispatch(release())}>
                  <div className={style.dialWrapper}>
                    <svg className={[
                      style.dial,
                      isPressed ? style.active : style.inactive,
                      style[`rotate-${position}`],
                    ].join(' ')} height="100%" width="100%">
                      <image xlinkHref={knob} height="100%" width="100%" />
                    </svg>
                    <span>&nbsp;</span>
                  </div>
                </Button>
              </Grid.Column>
            </Grid>
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