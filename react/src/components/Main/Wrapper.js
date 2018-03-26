import styled from 'styled-components';
import media from 'utils/mediaquery';
import { Layout } from 'antd';

export default styled(Layout)`
  min-height: 100vh;

  > .ant-layout-header {
    position: fixed;
    width: 100%;
    z-index: 1000;

    .title-logo {
      float: left;
      margin: 0 24px -1px 10px;
    }

    .ant-menu {
      float: left;
      line-height: 50px;

      .ant-menu-item {
        padding: 0 16px;
      }
    }
  }

  > .ant-layout-content {
    /* display: flex; */
    position: relative;
    margin-top: 50px;
  }

  > .ant-layout-footer {
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

      span {
        margin-left: 15px;
      }
    }
  }
`;
