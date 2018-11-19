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

      .ant-list-item-meta {
        align-items: center;

        .ant-list-item-meta-title {
          font-size: 16px;
        }
      }

      .ant-list-item-content {
        justify-content: space-evenly;
        font-size: 12px;

        .PENDING,
        .OFFERED {
          color: ${colors.yellow};
        }

        .DECLINED {
          color: ${colors.error};
        }

        .ACCEPTED {
          color: ${colors.green};
        }
      }

      &:hover {
        cursor: pointer;
        background-color: ${colors.lightGreen};
      }
    }
  }
`;
