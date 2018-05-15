import styled from 'styled-components';
import { Form } from 'antd';
import media from 'utils/mediaquery';

export default styled(Form)`
  .with-public {
    display: inline-block;
    width: calc(100% - 90px);
  }

  .public-check {
    display: inline-block;
    padding-top: 8px;
    ${media.mobile`padding-top: 38px;`};
    float: right;
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
`;
