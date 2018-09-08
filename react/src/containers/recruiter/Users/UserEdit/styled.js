import styled from 'styled-components';
import { Form } from 'antd';
import media from 'utils/mediaquery';

export default styled(Form)`
  max-width: 700px;
  width: 100%;

  ${media.notmobile`
    .ant-form-item {
      .ant-form-item-label {
        width: 210px;
        vertical-align: top;
      }

      .ant-form-item-control-wrapper {
        display: inline-block;
        width: calc(100% - 210px);
      }
    }
  `};
`;
