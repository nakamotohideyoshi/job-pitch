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

      &:hover {
        cursor: pointer;

        .ant-list-item-meta-title {
          color: #00b6a4;
        }
      }
    }
  }
`;
