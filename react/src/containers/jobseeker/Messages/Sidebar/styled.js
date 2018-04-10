import styled from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  display: flex;
  flex-direction: column;
  background: ${colors.white} !important;
  border-right: 1px solid ${colors.gray2};

  .filters {
    width: 100%;
    padding: 23px 15px;
  }

  .applications {
    flex: 1;
    position: relative;
    overflow-y: auto;

    .ant-list {
      .ant-list-item {
        padding: 12px 10px;
        border-bottom: 1px solid ${colors.gray1};
        cursor: pointer;

        .ant-list-item-meta {
          width: 100%;

          .ant-list-item-meta-avatar {
            margin-right: 8px;
            .ant-avatar {
              width: 48px;
              height: 48px;
              border-radius: 50%;
            }
          }

          .ant-list-item-meta-content {
            width: calc(100% - 58px);

            .ant-list-item-meta-title {
              display: flex;
              justify-content: space-between;

              .date {
                font-size: 10px;
                color: ${colors.text3};
                font-weight: 300;
                margin-left: 8px;
              }
            }

            .ant-list-item-meta-description {
              font-size: 13px;
            }
          }
        }

        &.deleted {
          color: red;
          font-style: italic;
          text-decoration-line: line-through;
        }

        &.selected {
          background-color: ${colors.gray1};
          box-shadow: inset -4px 0px 0px 0px ${colors.primary};

          .title {
            color: ${colors.primary};
          }
        }

        &:hover {
          background-color: ${colors.gray1};
        }
      }

      .ant-list-pagination {
        margin-bottom: 24px;
        text-align: center;
      }
    }
  }
`;
