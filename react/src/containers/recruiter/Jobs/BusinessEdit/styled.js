import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  form {
    max-width: 700px;
    width: 100%;
    margin: 40px auto;
    padding: 0 15px;

    .logo-field {
      display: flex;

      .logo {
        display: inline-block;
        line-height: 0;
        padding: 8px;
        margin-right: 15px;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
      }

      .buttons {
        display: flex;
        flex-direction: column;

        .btn-upload {
          padding: 0;
          label {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 0 15px;
            cursor: pointer;
          }
          input {
            display: none;
          }
        }

        .ant-btn {
          margin-bottom: 8px;
        }
      }
    }

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
