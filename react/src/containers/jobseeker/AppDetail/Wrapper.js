import styled from 'styled-components';
import { Container } from 'components';
import media from 'utils/mediaquery';

export default styled(Container)`
  .content {
    margin-bottom: 40px;

    .buttons {
      margin-top: 8px;
    }
  }

  ${media.nottablet`
    .content {
      display: flex;

      .job-detail {
        flex: 1;
        margin-right: 50px;
      }

      .buttons {
        width: 200px;
        .ant-btn {
          width: 100%;
        }
      }
    }
  `};

  ${media.tablet`
    .ant-btn {
      width: 150px;
      margin: 25px 25px 0 0;
    }
  `};
`;
