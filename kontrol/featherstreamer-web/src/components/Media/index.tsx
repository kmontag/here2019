import React from 'react';
import { Grid, Header, Segment } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { ApplicationState, ConnectedReduxProps } from '../../store';
import { ServerStateState } from '../../store/serverState/reducer';
import chunk from 'lodash.chunk';

type Props = ServerStateState & ConnectedReduxProps;

class Media extends React.Component<Props> {
  render() {
    const selectedIndex = this.props.media.selectedIndex;

    let currentIndex: number = 0;
    const rows = chunk(this.props.media.names, 4).map((names) => {
      const cols = names.map((name) => {
        const content = (selectedIndex === currentIndex) ? (
          <strong>
            <u>
              {name}
            </u>
          </strong>
        ) : name;
        currentIndex++;

        return (
          <Grid.Column key={name} width={4}>
            {content}
          </Grid.Column>
        );
      });
      return (
        <Grid.Row key={currentIndex}>
          {cols}
        </Grid.Row>
      );
    });


    return (
      <div>
        <Header attached='top'>
          Media
        </Header>
        <Segment attached>
          <Grid>
            {rows}
          </Grid>
        </Segment>
      </div>
    );
  }
}

const mapStateToProps = (state: ApplicationState) => {
  return state.serverState;
}

export default connect(mapStateToProps)(Media);