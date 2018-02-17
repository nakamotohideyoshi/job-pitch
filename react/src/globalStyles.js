import { injectGlobal } from 'styled-components';
import media from 'utils/mediaquery';

injectGlobal`

  html {
    font-size: 14px;
  }

  a, a:hover, a:focus {
    color: inherit;
    cursor: pointer;
  }

  .block-line {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .btn {
    &.btn-yellow,
    &.btn-outline-yellow:hover {
      color: #fff !important;
    }

    &.btn-outline-gray {
      color: #000;
      border-color: #ced4da
    }
  }

  .single-line {
    display: block;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .description {
    white-space: pre-line;
  }

  .alert-msg {
    color: #888;
    font-size: 16px;
    text-align: center;
    white-space: pre-line;

    & + .btn-link {
      margin-top: 10px;
    }
  }

  .btn-link {
    color: #00b6a4 !important;
    font-size: 16px;

    svg {
      margin-right: 10px;
    }
  }

  .breadcrumb {
    /* display: block;
    background-color: transparent;
    text-align: right; */

    a {
      cursor: pointer;
      &:hover {
        text-decoration: underline !important;
      }
    }
  }

  form {
    label {
      margin-top: .5rem;
      font-weight: 500;
    }

    .form-group {
      margin-bottom: 1.5rem;
      ${media.tablet`margin-bottom: 1.2rem;`};
    }

    .form-control:disabled {
      background-color: #fff;
      opacity: 0.7;
    }

    .is-invalid ~ .invalid-feedback {
      display: block;
    }
  }

  .float-right {
    float: right;
  }

  .modal {
    .close {
      outline: none;
    }
  }

  .alert-success {
    background-color: rgba(212, 237, 218, 0.5);
    svg {
      margin-right: 8px;
      color: rgba(21, 87, 36, 0.8);
    }
  }
  .alert-info {
    background-color: rgba(209, 236, 241, 0.5);
    svg {
      margin-right: 8px;
      color: rgba(12, 84, 96, 0.8);
    }
  }
  .alert-warning {
    background-color: rgba(255, 243, 205, 0.5);
    svg {
      margin-right: 8px;
      color: rgba(133, 100, 4, 0.8);
    }
  }
  .alert-danger {
    background-color: rgba(248, 215, 218, 0.5);
    svg {
      margin-right: 8px;
      color: rgba(114, 28, 36, 0.8);
    }
  }

  /**
  |--------------------------------------------------
  | container
  |--------------------------------------------------
  */

  @media (max-width: 767px) {
    .container {
      max-width: 100%;
    }
  }

  /* @media (min-width: 768px) {
    .container {
      max-width: 720px;
    }
  }
  
  @media (min-width: 992px) {
    .container {
      max-width: 960px;
    }
  } */
  
  @media (min-width: 1200px) {
    .container {
      max-width: 1000px;
    }
  }

  /**
  |--------------------------------------------------
  | textarea
  |--------------------------------------------------
  */

  textarea {
    width: 100%;
    padding: 0.375rem 0.75rem;
    border-radius: 0.25rem;
    border: 1px solid #ced4da;
    resize: none;
    outline: none;

    &:focus {
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
      border-color: rgba(0, 123, 255, 0.58);
      outline: 0;
    }

    &.is-invalid {
      border-color: #dc3545;
      &:focus {
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
        border-color: rgba(220, 53, 69, 0.58);
      }
    }
  }

  /**
  |--------------------------------------------------
  | select
  |--------------------------------------------------
  */

  .Select {
    &.is-focused:not(.is-open) > .Select-control {
      box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
      transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
      border-color: rgba(0, 123, 255, 0.58);
      outline: 0;
    }

    &.is-invalid {
      .Select-control {
        border-color: #dc3545;
      }
      .Select-menu-outer {
        border-left-color: #dc3545;
        border-right-color: #dc3545;
        border-bottom-color: #dc3545;
      }

      &.is-focused:not(.is-open) > .Select-control {
        box-shadow: inset 0 1px 1px rgba(0, 0, 0, .075), 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
        transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out, -webkit-box-shadow 0.15s ease-in-out;
        border-color: rgba(220, 53, 69, 0.58);
      }
    }

    &.Select--single .Select-control {
      height: 34px;
      .Select-value, .Select-input {
        height: 32px;
      }
    }
  }
  
  /**
  |--------------------------------------------------
  | textarea
  |--------------------------------------------------
  */

  .notifications-tr {
    top: 50px !important;

    .notification-success {
      background-color: rgb(212, 237, 218) !important;
      border-top: 2px solid rgb(21, 87, 36) !important;
      box-shadow: #155724 0px 0px 1px !important;
      color: rgb(21, 87, 36) !important;
      .notification-dismiss {
        background-color: rgba(21, 87, 36, 0.6) !important;
        color: rgb(212, 237, 218) !important;
      }
    }

    .notification-error {
      background-color: rgb(248, 215, 218) !important;
      border-top: 2px solid rgb(114, 28, 36) !important;
      box-shadow: #a94442 0px 0px 1px !important;
      color: rgb(114, 28, 36) !important;
      .notification-dismiss {
        background-color: rgba(114, 28, 36, 0.6) !important;
        color: rgb(248, 215, 218) !important;
      }
    }
  }
}
`;
