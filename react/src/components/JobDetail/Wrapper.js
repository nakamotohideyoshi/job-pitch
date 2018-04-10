import styled from 'styled-components';

export default styled.div`
  .ant-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
  }

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

  .map {
    position: relative;
    width: 100%;
    padding-top: 50%;
    margin-top: 10px;

    > div {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
    }
  }
`;
