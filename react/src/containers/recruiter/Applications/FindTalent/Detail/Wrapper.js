import styled from 'styled-components';
import media from 'utils/mediaquery';
import { Container } from 'components';

export default styled(Container)`
  min-height: 200px;

  .content {
    padding-bottom: 40px;

    .buttons {
      margin-top: 8px;
    }

    .record-info {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-top: 8px;

      &:hover {
        background-color: #dcf5ee;
      }

      > * {
        cursor: pointer;
      }

      > span i {
        margin-right: 8px;
        color: #8c8c8c;
      }

      > i {
        color: #8c8c8c;

        &:hover {
          color: #595959;
        }
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
