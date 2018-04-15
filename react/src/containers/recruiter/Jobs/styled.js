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

    .ant-list-item {
      position: relative;
      padding-left: 12px;
      padding-right: 12px;

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

  form {
    max-width: 700px;
    width: 100%;
    margin: 40px auto;
    padding: 0 15px;

    .fa-question-circle {
      color: #ff9300;
    }

    textarea {
      resize: none;
    }

    .subimt-field {
      margin-top: 15px;

      .ant-btn {
        width: 170px;
        margin-right: 15px;
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
