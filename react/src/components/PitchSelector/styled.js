import styled from 'styled-components';

export default styled.div`
  .buttons {
    display: flex;

    .currentPitch {
      position: relative;
      display: inline-block;
      width: 104px;
      height: 104px;
      margin-right: 15px;
      padding: 8px;
      border-radius: 4px;
      border: 1px solid #d9d9d9;
      cursor: pointer;

      .thumbnail {
        width: 100%;
        height: 100%;
        background-size: cover;
        background-position: center;
      }

      .mask {
        position: absolute;
        display: flex;
        justify-content: center;
        align-items: center;
        left: 8px;
        right: 8px;
        top: 8px;
        bottom: 8px;
        transition: background-color 0.3s;

        svg {
          font-size: 30px;
          color: transparent;
          transition: color 0.3s;
        }

        &:hover {
          background-color: rgba(0, 0, 0, 0.5);
          svg {
            color: rgba(255, 255, 255, 0.85);
          }
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
