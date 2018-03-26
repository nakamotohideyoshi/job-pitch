import styled from 'styled-components';
import { Container } from 'components';
import media from 'utils/mediaquery';

export default styled(Container)`
  .ant-list {
    margin-bottom: 30px;

    .ant-list-item {
      .ant-list-item-meta-title {
        font-size: 16px;
      }

      .properties {
        font-size: 12px;
        span {
          display: inline-block;
        }
      }

      .ant-list-item-action {
        span:hover {
          color: #00b6a4;
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

  form {
    max-width: 700px;
    width: 100%;
    margin: 40px auto;
    padding: 0 15px;

    .subimt-field {
      margin-top: 15px;

      .ant-btn {
        width: 150px;
        margin-right: 20px;
      }
    }

    ${media.notmobile`
      .ant-form-item {
        .ant-form-item-label {
          width: 120px;
          vertical-align: top;
        }

        .ant-form-item-control-wrapper {
          display: inline-block;
          width: calc(100% - 120px);
          vertical-align: top;
        }
      }
    `};
  }
`;
