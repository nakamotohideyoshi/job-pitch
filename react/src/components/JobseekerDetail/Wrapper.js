import styled from 'styled-components';

export default styled.div`
  .ant-list-item-meta-title {
    display: flex;
    justify-content: space-between;

    .title {
      font-size: 16px;
    }

    .distance {
      color: #8c8c8c;
    }
  }

  .overview {
    div {
      white-space: pre-line;
    }
  }

  .check-label {
    display: flex;
    margin-top: 0.5rem;

    svg {
      margin-right: 0.5rem;
      font-size: 1.5rem;
      color: #ff9300;
    }
  }
`;
