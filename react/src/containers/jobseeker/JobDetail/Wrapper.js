import styled from 'styled-components';
import { Container } from 'components';
import media from 'utils/mediaquery';

export default styled(Container)`
  .content {
    padding-bottom: 40px;

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
          margin-top: 25px;
        }

        .ant-btn:first-child {
          margin-top: 0px;
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
