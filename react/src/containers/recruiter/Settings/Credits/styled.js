import styled from 'styled-components';

export const Wrapper = styled.div`
  width: 100%;
  max-width: 400px;

  .ant-select {
    width: 100%;
    margin-bottom: 20px;

    .ant-select-selection-selected-value .logo {
      float: left;
      margin: 4px 8px 0 0 !important;
    }

    .credits {
      margin-left: 5px;
    }
  }

  .ant-list {
    .credits {
      width: 100px;
    }
  }
`;
