import React, { PureComponent } from 'react';
import styled from 'styled-components';
import media from 'utils/mediaquery';

const Wrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  bottom: 100px;
  ${media.mobile`bottom: 65px;`};
  width: 100%;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  span {
    margin-bottom: 20px;
    font-size: 40px;
    ${media.mobile`font-size: 25px;`};
  }

  div {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 150px;
    border-radius: 50%;
    border: 3px solid #fff;
    font-size: 70px;
    ${media.mobile`
      width: 90px;
      height: 90px;
      border: 2px solid #fff;
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
