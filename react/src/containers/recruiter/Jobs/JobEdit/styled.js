import styled from 'styled-components';
import { Form } from 'antd';
import media from 'utils/mediaquery';

export default styled(Form)`
  .btn-play {
    position: absolute;
    top: 4px;
    left: 125px;
  }

  ${media.mobile`
    .status-field {
      .ant-form-item-label {
        display: inline-block;
        width: 50px;
        padding-bottom: 5px;
      }
      .ant-form-item-control-wrapper {
        display: inline-block;
        width: calc(100% - 50px);
      }
    }
  `};
`;
