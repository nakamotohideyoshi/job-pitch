import styled from 'styled-components';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    position: relative;
    margin-bottom: 40px;

    .ant-list-item {
      position: relative;

      .ant-list-item-meta-title {
        font-size: 16px;
      }

      .properties {
        font-size: 12px;
        span {
          display: inline-block;
        }
        span:nth-child(1) {
          width: 100px;
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

      &.loading {
        pointer-events: none;

        .mask {
          background-color: rgba(255, 255, 255, 0.5);
          z-index: 1;
        }
      }

      &:hover {
        cursor: pointer;

        .ant-list-item-meta-title {
          color: #00b6a4;
        }
      }
    }
  }
`;
