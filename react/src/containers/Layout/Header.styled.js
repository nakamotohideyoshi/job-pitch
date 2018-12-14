import styled from 'styled-components';
import { Layout, Menu } from 'antd';

import media from 'utils/mediaquery';

export default styled(Layout.Header)`
  position: fixed;
  width: 100%;
  z-index: 100;

  .container {
    padding: 0;
  }

  .i-bars {
    display: none;
    ${media.tablet`
      display: inline-block;
    `};
    font-size: 20px;
    position: absolute;
    left: 15px;
    top: 15px;
    color: #999;
    &:hover {
      color: #fff;
    }
  }

  .title-logo {
    display: inline-block;
    margin: 0 20px 0 10px;
    width: 172px;
    position: relative;
    top: -5px;
    & > img {
       width: 100%;
    }
  }

  .left-menu {
    display: inline-block;
    width: calc(100% - 302px);

    ${media.tablet`
      float: left;
      width: 50px;
    `};

    .ant-menu-item {
      line-height: 50px;
      padding: 0 12px;
    }

    .ant-menu-overflowed-submenu {
      span {
        ${media.tablet`
          opacity: 0;
        `};
      }
    }
  }

  .right-menu {
    float: right;
    display: flex;

    > div {
      display: flex;
      height: 50px;
      align-items: center;

      padding: 0 10px;
      color: #999999;
      transition: color 0.3s;
      font-size: 20px;
      cursor: pointer;

      &:hover {
        color: #fff;
      }
    }
  }
`;

export const ShareMenu = styled(Menu)`
  display: inline-block;
  padding: 0 !important;

  li {
    padding: 0 !important;
    height: 32px !important;
    margin: 0 !important;

    .SocialMediaShareButton {
      transition: opacity 0.3s;
      &:hover {
        opacity: 0.5;
      }
    }
  }
`;

export const UserMenu = styled.div`
  .info {
    display: flex;
    align-items: center;
    margin-bottom: 15px;

    .ant-avatar {
      margin-right: 10px;
    }

    > div {
      max-width: 150px;
      h4 {
        margin: 0;
      }
      div {
        font-size: 13px;
      }
    }
  }

  .buttons {
    display: flex;
    button {
      flex: 1;
    }
    button + button {
      margin-left: 15px;
    }
  }
`;
