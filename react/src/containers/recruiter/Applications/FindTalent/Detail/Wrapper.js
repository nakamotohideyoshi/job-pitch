import styled from 'styled-components';
import media from 'utils/mediaquery';
import { Container } from 'components';

export default styled(Container)`
  min-height: 200px;

  .content {
    padding-bottom: 40px;

    .buttons {
      margin-top: 12px;
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

        .ant-btn + .ant-btn {
          margin-top: 25px;
        }
      }
    }
  `};

  ${media.tablet`
    .buttons { 
      padding-top: 25px;
    }
    .ant-btn {
      width: 150px;
      margin-right: 25px;
    }
  `};
`;
