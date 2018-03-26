import styled from 'styled-components';
import { Form } from 'antd';
import media from 'utils/mediaquery';

export default styled(Form)`
  max-width: 700px;
  width: 100%;

  .fa-question-circle {
    color: #ff9300;
  }

  .map {
    position: relative;
    width: 100%;
    padding-top: 50%;
    margin-top: 10px;

    > div {
      position: absolute;
      width: 100%;
      height: 100%;
      top: 0;
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
      }
    }
  `};
`;
