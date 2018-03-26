import React, { PureComponent } from 'react';
import { Progress } from 'antd';
import { Wrapper } from './Wrapper';

class PopupProgress extends PureComponent {
  render() {
    return (
      <Wrapper wrapClassName="ant-center-modal" visible footer={null} closable={false}>
        <label>{this.props.label}</label>
        {this.props.value && <Progress percent={this.props.value} status="active" />}
      </Wrapper>
    );
  }
}

export default PopupProgress;
