import styled from 'styled-components';

export default styled.div`
  width: 100%;
  max-width: 600px;

  .help-container {
    margin-bottom: 15px;
    font-size: 14px;
    color: #8c8c8c;
    text-align: center;
  }

  .video-container {
    position: relative;
    span {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      right: 0;
      color: #fff;
    }
  }

  .button-container {
    margin-top: 20px;
    text-align: center;

    > div {
      display: inline-block;
    }

    button {
      width: 150px;
      margin: 0 10px;
      svg {
        margin-right: 10px;
      }
    }
  }
`;
