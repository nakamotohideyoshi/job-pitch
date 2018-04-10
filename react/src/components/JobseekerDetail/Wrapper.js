import styled from 'styled-components';

export default styled.div`
  .ant-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

  .ant-list-item-meta-title {
    font-size: 16px;
  }

  .ant-list-item-meta-description {
    span + span {
      margin-left: 40px;
    }

    a {
      display: inline-flex;
      align-items: center;
      color: #333;
      margin-top: 1em;
      cursor: pointer;

      svg {
        color: #00b6a4;
        font-size: 1.6em;
        margin-right: 4px;
      }
    }
  }

  .overview {
    white-space: pre-line;
    margin-bottom: 1em;
  }

  .check-label {
    display: flex;
    margin-top: 0.5em;

    svg {
      margin-right: 0.25em;
      font-size: 1.5em;
      color: #ff9300;
    }
  }

  p {
    margin-bottom: 0.25em;
  }
`;
