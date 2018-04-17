import styled from 'styled-components';
import media from 'utils/mediaquery';
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
    ${media.tablet`padding: 25px 10px;`};

    .ant-list-item {
      position: relative;
      padding-left: 12px;
      padding-right: 12px;

      .ant-list-item-meta-title {
        font-size: 16px;
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
        background-color: ${colors.lightGreen};

        .ant-list-item-meta-title {
          color: #00b6a4;
        }
      }
    }
  }
`;
