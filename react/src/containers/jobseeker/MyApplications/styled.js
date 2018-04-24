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

      .ant-list-item-content {
        flex: initial;

        .ant-list-item-meta-title {
          font-size: 16px;
        }

        .properties {
          font-size: 12px;
          span {
            display: inline-block;
          }
        }
      }

      .ant-list-item-action {
        span {
          padding: 4px;
          &:hover {
            color: #00b6a4;
          }
        }
      }

      &:hover {
        cursor: pointer;
        background-color: ${colors.lightGreen};
      }
    }
  }
`;
