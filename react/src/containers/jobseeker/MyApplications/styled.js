import styled from 'styled-components';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    position: relative;
    margin-bottom: 40px;
  }

  .ant-list-item {
    position: relative;

    .ant-list-item-meta-title {
      font-size: 16px;
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
