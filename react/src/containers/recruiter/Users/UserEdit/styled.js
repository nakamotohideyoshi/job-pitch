import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;

  form {
    margin: 30px auto;
    max-width: 700px;
    width: 100%;
    padding: 0 15px;

    .subimt-field {
      margin-top: 15px;

      .ant-btn {
        width: 150px;
        margin-right: 15px;
        margin-bottom: 8px;
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
