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
  }
`;
