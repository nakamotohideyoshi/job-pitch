import React, { PureComponent } from 'react';
import styled from 'styled-components';
import media from 'utils/mediaquery';

const Wrapper = styled.div`
  position: absolute;
  width: 90px;
  padding: 5px;
  top: 30px;
  ${media.desktop`top: 20px;`};
  left: 0;
  right: 0;
  margin: auto;
  background-color: rgba(0, 0, 0, 0.3);
  border-radius: 2px;
  color: white;
  letter-spacing: 1px;
  white-space: pre;

  label {
    text-align: center;
    margin-left: 15px;
    margin-bottom: 0;
  }
`;

const RecIcon = styled.span`
  width: 12px;
  height: 12px;
  margin: 5px -5px 5px 8px;
  float: left;
  background-color: red;
  border-radius: 6px;
  animation: blink 1s infinite;

  @keyframes blink {
    0% {
      opacity: 1;
    }
    49% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    99% {
      opacity: 0;
    }
  }
`;

class RecLabel extends PureComponent {
  render() {
    const { isRec, time } = this.props;
    let label;
    if (isRec) {
      label = time < 10 ? `0:0${time}` : `0:${time}`;
    } else {
      label = `READY\n${time}`;
    }

    return (
      <Wrapper>
        {this.props.isRec && <RecIcon />}
        <label>{label}</label>
      </Wrapper>
    );
  }
}

export default RecLabel;
