import React, { PureComponent } from 'react';
import { Progress } from 'reactstrap';
import Wrapper from './Wrapper';

class PopupProgress extends PureComponent {
  render() {
    return (
      <Wrapper isOpen fade={false}>
        <label>{this.props.label}</label>
        {this.props.value && (
          <Progress animated color="yellow" value={this.props.value}>
            {this.props.value}%
          </Progress>
        )}
      </Wrapper>
    );
  }
}

export default PopupProgress;
