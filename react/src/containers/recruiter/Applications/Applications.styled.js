import styled from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  .ant-tabs-nav-container {
    font-size: 12px;
    font-weight: 500;
  }

  .ant-tabs-tabpane {
    flex: 1;
    position: relative;
    margin-bottom: 40px;
    min-height: 150px;

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
        span {
          width: 30px;
          height: 30px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          border-radius: 50%;
          &:hover {
            box-shadow: 0px 0 4px 0px rgba(0, 0, 0, 0.15);
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
      }
    }
  }
`;
