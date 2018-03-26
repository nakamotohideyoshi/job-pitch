import styled from 'styled-components';

export default styled.div`
  margin-bottom: 30px;

  .sub-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  }

  .ant-list-item {
    .ant-list-item-meta-title {
      font-size: 16px;
    }

    .properties {
      font-size: 12px;
      span {
        display: inline-block;
      }
      span + span {
        margin-left: 50px;
      }
    }

    .ant-list-item-action {
      span:hover {
        color: #00b6a4;
      }
    }

    &:hover {
      cursor: pointer;

      .ant-list-item-meta-title {
        color: #00b6a4;
      }
    }
  }
`;
