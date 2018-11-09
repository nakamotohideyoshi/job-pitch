import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

import media from 'utils/mediaquery';

const Wrapper = styled.div`
  position: absolute;
  top: 3%;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    margin-bottom: 20px;
    font-size: 30px;
    ${media.mobile`
      margin-bottom: 10px;
      font-size: 25px;
    `};
  }

  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100px;
    height: 100px;
    border-radius: 50%;
    border: 4px solid #fff;
    font-size: 60px;
    ${media.mobile`
      width: 70px;
      height: 70px;
      border: 3px solid #fff;
      font-size: 40px;
    `};
  }
`;

class ReadyLabel extends PureComponent {
  render() {
    const { time } = this.props;

    return (
      <Wrapper>
        <span>Get Ready!</span>
        <div>{time}</div>
      </Wrapper>
    );
  }
}

ReadyLabel.propTypes = {
  time: PropTypes.number.isRequired
};

export default ReadyLabel;
