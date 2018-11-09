import styled from 'styled-components';

export default styled.div`
  .buttons {
    display: flex;

    .currentPitch {
      position: relative;
      display: inline-block;
      width: 162px;
      height: 96px;
      margin-right: 15px;
      padding: 6px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      cursor: pointer;

      .thumbnail {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
      }

      .play-icon {
        position: absolute;
        top: 50%;
        left: 50%;
        margin-left: -25px;
        margin-top: -25px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.2);
        &:before {
          content: '\\F101';
          display: block;
          line-height: 50px;
          color: #fff;
          font-family: VideoJS;
          font-size: 36px;
          text-align: center;
        }
      }

      &:hover {
        .play-icon {
          background-color: rgba(0, 0, 0, 0.4);
        }
      }
    }

    .newPitch {
      flex: 1;
    }
  }

  .newInfo {
    margin-top: 7px;
    line-height: initial;
    color: #8c8c8c;

    a {
      color: #595959;
      text-decoration: underline;
    }
  }
`;
