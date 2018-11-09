import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
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

PopupProgress.propTypes = {
  label: PropTypes.string,
  value: PropTypes.number
};

PopupProgress.defaultProps = {
  label: null,
  value: null
};

export default PopupProgress;
