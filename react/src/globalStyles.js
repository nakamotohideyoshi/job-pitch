import { injectGlobal } from 'styled-components';
import media from 'utils/mediaquery';

injectGlobal`
  html {
    font-size: 14px;
  }

  textarea.ant-input {
    resize: none;
  }

  .container {
    @media (min-width: 768px) {
      max-width: 720px;
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

  .description {
    white-space: pre-line;
    word-break: break-all;
    hyphens: auto;
  }

  .avatar-80 {
    width: 80px !important;
    height: 80px !important;
    border-radius: 50% !important;
  }

  .avatar-48 {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50% !important;
  }
 
  .shadow1 {
    box-shadow: 0 3px 12px rgba(0, 0, 0, 0.25);
    ${media.tablet`
      box-shadow: none;
    `};
  }

  .alert-msg {
    color: #8c8c8c;
    font-size: 14px;
    text-align: center;
    white-space: pre-line;

    & + .btn-link {
      margin-top: 10px;
    }
  }

  .btn-link {
    color: #00b6a4 !important;
    font-size: 14px;

    i, svg {
      margin-right: 8px;
    }
  }

  .single-line {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  /* ant design */

  .ant-btn {
    i, svg {
      margin-right: 8px;
    }
  }

  .ant-menu-item {
    svg {
      margin-right: 8px;
    }
  }

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

  .ant-select-selection__choice__content {
    display: flex !important;

    span {
      margin-right: 5px;
    }
  }
}
`;
