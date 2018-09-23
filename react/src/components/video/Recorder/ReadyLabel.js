import React, { PureComponent } from 'react';
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
    font-size: 40px;
    ${media.mobile`
      margin-bottom: 10px;
      font-size: 25px;
    `};
  }

  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    border: 5px solid #fff;
    font-size: 70px;
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

export default ReadyLabel;
