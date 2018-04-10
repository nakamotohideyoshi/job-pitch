import styled from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;

  .messages {
    flex: 1;
    padding: 25px 15px;
    overflow-y: auto;

    .ant-avatar {
      min-width: 32px;
      margin-top: 4px;
    }

    .bubble {
      position: relative;
      display: inline-block;
      border-radius: 5px;
      padding: 10px 18px;
      color: #fff;
      text-align: left;
      white-space: pre-line;
    }

    .bubble::before {
      content: '';
      position: absolute;
      top: 10px;
      border-style: solid;
      border-color: transparent;
      border-width: 10px 15px;
    }

    .time {
      font-size: 12px;
      color: #959595;
      margin-top: 5px;

      &.error {
        color: ${colors.error};
      }
    }

    .you {
      display: flex;
      margin-bottom: 10px;
      margin-right: 52px;
      .message {
        margin-left: 20px;
      }
      .bubble {
        background-color: ${colors.yellow};
      }
      .bubble::before {
        left: -30px;
        border-right-color: ${colors.yellow};
      }
    }

    .me {
      display: flex;
      margin-bottom: 10px;
      margin-left: 52px;
      justify-content: flex-end;
      text-align: right;
      .message {
        margin-right: 20px;
      }
      .bubble {
        background-color: ${colors.green};
      }
      .bubble::before {
        right: -30px;
        border-left-color: ${colors.green};
      }
    }
  }

  .input {
    display: flex;
    align-items: flex-end;
    padding: 15px;
    border-top: 1px solid #e0e0e0;

    textarea {
      border: none;
      box-shadow: none;
      resize: none;
      transition: none;
    }

    svg {
      margin: 5px 15px;
      color: ${colors.primary};
      cursor: pointer;

      &.disabled {
        color: #999;
        pointer-events: none;
      }
    }

    div {
      width: 100%;
      padding: 4px 11px;
      color: #999;
      text-align: center;
    }
  }
`;
