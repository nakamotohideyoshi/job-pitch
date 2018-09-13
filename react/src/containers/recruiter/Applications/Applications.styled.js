import styled from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  .ant-select {
    flex: 1;
    margin-right: 20px;
  }

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

      .ant-list-item-meta {
        align-items: center;
        width: calc(100% - 108px);

        .ant-list-item-meta-avatar {
          position: relative;
          svg {
            position: absolute;
            left: -6px;
            top: -6px;
            font-size: 12px;
            color: ${colors.yellow};
          }
        }

        .ant-list-item-meta-content {
          width: calc(100% - 96px);

          .ant-list-item-meta-title {
            font-size: 16px;
          }

          .ant-list-item-meta-description {
            .PENDING {
              color: ${colors.yellow};
              font-size: 12px;
            }

            .ACCEPTED {
              color: ${colors.green};
              font-size: 12px;
            }
          }
        }
      }

      .ant-list-item-content {
        flex: initial;
      }

      .ant-list-item-action {
        margin-left: 24px;
      }

      &:hover {
        cursor: pointer;
        background-color: ${colors.lightGreen};
      }

      &.loading {
        pointer-events: none;

        .mask {
          background-color: rgba(255, 255, 255, 0.5);
          z-index: 1;
        }
      }
    }

    .interview {
      .ant-list-item-content {
        justify-content: center;
        font-size: 12px;

        div {
          margin: 4px 0;
        }
      }
    }
  }
`;
