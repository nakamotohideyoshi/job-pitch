import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  .content {
    position: relative;
    padding: 40px 0;
    ${media.tablet`padding: 25px 10px;`};

    .ant-list-item {
      .ant-list-item-meta-title {
        font-size: 16px;
        margin: 4px 0;
      }

      .ant-list-item-meta-avatar {
        position: relative;

        .star {
          position: absolute;
          left: -12px;
          top: -12px;
          color: #ff9300;
          background-color: #fff;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
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
