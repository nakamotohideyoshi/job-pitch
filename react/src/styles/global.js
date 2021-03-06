import { createGlobalStyle } from 'styled-components';

import media from 'utils/mediaquery';

export default createGlobalStyle`
  html {
    font-size: 14px;
  }

  .container {
    @media (min-width: 768px) {
      max-width: 750px;
    }
    @media (min-width: 992px) {
      max-width: 960px;
    }

    @media (min-width: 1200px) {
      max-width: 1140px;
    }

    width: 100%;
    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }

  .shadow {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
    ${media.tablet`
      box-shadow: none;
    `};
  }

  .description {
    white-space: pre-line;
    word-break: break-all;
    hyphens: auto;
  }

  .single-line {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  /* ant design */

  .ant-select-selection-selected-value,
  .ant-select-dropdown-menu-item {
    width: 100%;
    white-space: initial !important;

    .logo {
      margin-right: 8px;
      float: left;
    }

    .right-menu-item {
      float: right;
      opacity: 0.5;
    }
  }
  
  &.ant-select-selection-selected-value {
    .logo {
      margin-top: 4px;
    }
  }

  .ant-select-selection__choice__content {
    display: flex !important;

    span {
      margin-right: 5px;
    }
  }

  .ant-list-item-action {
    span {
      width: 30px;
      height: 30px;
      display: inline-flex;
      justify-content: center;
      align-items: center;
      border-radius: 50%;
      &:hover {
        box-shadow: 0px 0 4px 0px rgba(0, 0, 0, 0.15);
      }
    }
  }
}
`;
