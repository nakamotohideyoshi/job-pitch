import React, { PureComponent } from 'react';
import { Progress } from 'antd';
import { Wrapper } from './styled';

class PopupProgress extends PureComponent {
  render() {
    return (
      <Wrapper centered visible footer={null} closable={false}>
        <label>
          {this.props.label} {this.props.value && <span>{this.props.value}%</span>}
        </label>
        {this.props.value && <Progress percent={this.props.value} status="active" showInfo={false} />}
      </Wrapper>
    );
  }
}

export default PopupProgress;
