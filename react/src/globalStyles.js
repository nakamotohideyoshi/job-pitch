import { injectGlobal } from 'styled-components';
import media from 'utils/mediaquery';

injectGlobal`
  html {
    font-size: 14px;
  }

  .container {
    width: 100%;
    @media (max-width: 767px) {
      max-width: 100%;
    }
    @media (min-width: 768px) {
      max-width: 720px;
    }
    @media (min-width: 992px) {
      max-width: 960px;
    }

    padding-right: 15px;
    padding-left: 15px;
    margin-right: auto;
    margin-left: auto;
  }

  .deleted {
    text-decoration: line-through red;
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

  .ant-btn {
    i, svg {
      margin-right: 8px;
    }
  }

  /* Select with logo */

  .ant-select-selection--single .ant-select-selection-selected-value,
  .ant-select-dropdown--single .ant-select-dropdown-menu-item {
    .logo {
      margin-right: 8px;
      float: left;
    }
    &.ant-select-selection-selected-value {
      .logo {
        margin-top: 8px;
      }
    }
  }
}
`;
