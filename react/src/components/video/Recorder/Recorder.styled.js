import styled from 'styled-components';
import { Modal } from 'antd';
import media from 'utils/mediaquery';

export const Wrapper = styled(Modal)`
  width: 648px !important;

  .ant-modal-body {
    position: relative;
    color: #fff;

    .bottom-content {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      color: #fff;
      font-size: 18px;
      text-align: center;
      ${media.mobile`
        font-size: 14px;
      `};

      ul {
        display: inline-block;
        margin: 0;
        text-align: left;
      }
    }
  }
`;

export const VideoContainer = styled.div`
  position: relative;

  video {
    width: 100%;
    background-color: #000;
  }
`;

export const RecButton = styled.div`
  position: relative;
  padding-top: 10%;
  margin: 3% auto;
  width: 10%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);

  span {
    position: absolute;
    width: 40%;
    padding-top: 40%;
    top: 30%;
    left: 30%;
    background-color: red;
  }
`;

export const TimeBar = styled.div`
  div {
    position: absolute;
    width: 100%;
    height: 3px;
    left: 0;
    bottom: 5px;
    background-color: rgba(0, 0, 0, 0.5);
  }
  div:last-child {
    background-color: red;
  }
`;

export const ErrorLabel = styled.span`
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
`;
