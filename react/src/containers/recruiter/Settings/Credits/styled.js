import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 400px;

  .ant-select {
    width: 100%;
    margin-bottom: 20px;

    .credits {
      margin-left: 5px;
    }
  }

  .ant-list {
    .credits {
      width: 100px;
    }

    .ant-list-item-action {
      button {
        width: 100px;
      }
    }
  }
`;
