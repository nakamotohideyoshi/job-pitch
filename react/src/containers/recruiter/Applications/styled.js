import styled from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  .content {
    flex: 1;
    position: relative;
    margin-bottom: 40px;
    min-height: 100px;

    .ant-list-item {
      position: relative;
      padding-left: 12px;
      padding-right: 12px;

      .ant-list-item-meta-avatar {
        position: relative;
        svg {
          position: absolute;
          left: -6px;
          top: -6px;
          font-size: 12px;
          color: #ff9300;
        }
      }

      .ant-list-item-content {
        flex: initial;

        .ant-list-item-meta-title {
          font-size: 16px;
        }
      }

      .ant-list-item-action {
        opacity: 0;
        transition: opacity 0.3s;
        span {
          padding: 4px;
          &:hover {
            color: #00b6a4;
          }
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
        background-color: ${colors.lightGreen};

        .ant-list-item-action {
          opacity: 1;
        }
      }
    }
  }
`;
