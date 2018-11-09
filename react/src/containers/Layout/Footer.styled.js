import styled from 'styled-components';
import { Layout } from 'antd';

import media from 'utils/mediaquery';

export default styled(Layout.Footer)`
  text-align: center;
  ${media.tablet`padding: 25px 0;`};

  a {
    display: inline-block;
    color: #999999;
    cursor: pointer;

    &:hover {
      color: #fff !important;
    }
  }

  .menus a {
    margin: 5px 15px;
    &:hover {
      text-decoration: underline !important;
    }
  }

  .follow a {
    margin: 15px 10px 0 10px;
  }

  .company {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 20px;
    color: #999999;

    img {
      width: 25px;
      margin-right: 15px;
    }
  }
`;
