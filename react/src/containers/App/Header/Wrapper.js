import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.header`
  .navbar.navbar-expand-md {
    padding: 0 15px;
    background-color: #333 !important;

    .navbar-brand {
      display: flex;
      align-items: center;
      height: 50px;
      cursor: pointer;
    }

    .navbar-toggler {
      border: none;
      outline: none !important;
    }

    .nav-item > a {
      display: flex;
      align-items: center;
      height: 50px;
      padding: 0 15px;
      color: #999999;
      cursor: pointer;
      text-decoration: none;

      &:hover {
        color: #fff;
      }
    }

    .active.nav-item > a {
      background-color: #272727;
      color: #fff;
    }

    .dropdown.show.nav-item > a {
      background-color: transparent;
    }

    .dropdown {
      .dropdown-menu {
        margin: 0;
        padding: 0;
        border: none;
        border-radius: 0;
        background-color: #333;

        .dropdown-item {
          height: 40px;
          background-color: transparent;
          color: #999999;
          outline: none;
          cursor: pointer;

          &:hover {
            color: #fff;
          }

          &.active {
            background-color: #272727;
            color: #fff;
          }
        }

        .dropdown-divider {
          margin: 0;
          border-color: rgba(255, 255, 255, 0.1);
        }
      }
    }

    ${media.tablet`
      .navbar-collapse {
        margin: 0 -15px;

        .nav-item > a {
          height: 40px;
        }

        .dropdown {
          .dropdown-menu {
            .dropdown-item {
              padding: 0 30px;
            }

            .dropdown-divider {
              display: none;
            }
          }
        }
      }
    `};
  }
`;
