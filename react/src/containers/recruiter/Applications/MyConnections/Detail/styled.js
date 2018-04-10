import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  min-height: 200px;

  .content {
    padding-bottom: 40px;

    .buttons {
      margin-top: 12px;

      .ant-switch {
        margin-left: 8px;
      }
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
      }
    }
  `};

  ${media.tablet`
    .buttons {
      padding-top: 25px;

      .ant-btn {
        width: 150px;
        margin: 25px 25px 0 0;
      }
    }
  `};
`;
