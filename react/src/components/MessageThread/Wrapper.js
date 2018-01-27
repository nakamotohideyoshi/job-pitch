import styled from 'styled-components';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  width: 100%;
  height: 100%;

  .messages {
    flex: 1;
    padding: 25px 15px;
    overflow-y: auto;

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
    }

    .you {
      display: flex;
      margin-bottom: 10px;
      margin-right: 90px;
      .message {
        margin-left: 20px;
      }
      .bubble {
        background-color: #ff9300;
      }
      .bubble::before {
        left: -30px;
        border-right-color: #ff9300;
      }
    }

    .me {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 10px;
      margin-left: 90px;
      text-align: right;
      .message {
        margin-right: 20px;
      }
      .bubble {
        background-color: #00b6a4;
      }
      .bubble::before {
        right: -30px;
        border-left-color: #00b6a4;
      }
    }

    .avatar {
      min-width: 40px;
    }
  }

  .input {
    padding: 15px;
    border-top: 1px solid #e0e0e0;

    button + textarea {
      width: calc(100% - 95px);
    }

    button {
      width: 80px;
      float: right;
    }
  }
`;
