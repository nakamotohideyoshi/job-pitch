import styled from 'styled-components';
import { Card } from 'antd';

export default styled(Card)`
  /* display: block;
  max-width: 250px;
  height: 100%;
  margin: auto; */
  margin: 0 15px;

  .logo {
    padding-top: 75%;
    border-top-left-radius: 1px;
    border-top-right-radius: 1px;
  }

  > svg {
    position: absolute;
    top: 10px;
    left: 10px;
    color: #ff9300;
  }

  .properties {
    display: flex;
    justify-content: space-between;
  }

  .card-body {
    position: relative;

    .card-title {
      margin-right: 15px;
      font-size: 16px;
    }
  }

  .card-footer {
    padding-top: 0;
    border-top: 0;
    background-color: transparent;
  }

  .mask {
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: rgba(0, 0, 0, 0.5);
    border-radius: calc(0.25rem - 1px);
  }

  &.loading {
    cursor: inherit;
    pointer-events: none;
  }

  .dropdown {
    position: absolute;
    top: 8px;
    right: 0;

    .dropdown-menu {
      min-width: auto;
      &:before,
      &:after {
        position: absolute;
        display: block;
        content: '';
        border-style: solid;
        border-color: transparent;
        right: 8px;
        border-width: 0 9px 9px 9px;
      }
      &:before {
        top: -9px;
        border-bottom-color: rgba(0, 0, 0, 0.15);
      }
      &:after {
        top: -8px;
        border-bottom-color: #fff;
      }
    }

    a {
      display: inline-block;
      padding: 8px 15px;
      svg {
        font-size: 16px;
      }
    }

    button {
      outline: none;
    }
  }
`;
