import styled from 'styled-components';
import media from 'utils/mediaquery';
import { Container } from 'components';

export default styled(Container)`
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

        svg.fa-star {
          position: absolute;
          left: -12px;
          top: -12px;
          padding: 4px;
          font-size: 24px;
          color: #ff9300;
          background-color: #fff;
          border-radius: 50%;
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
