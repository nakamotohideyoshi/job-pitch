import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
  /* position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  margin-top: 50px;
  padding: 15px;
  background-color: #f9f9f9; */

  .board {
    position: relative;
    height: 100%;
    padding: 0;

    .sidebar {
      display: flex;
      flex-direction: column;
      position: absolute;
      width: 300px;
      top: 0;
      bottom: 0;
      left: 0;
      border-right: 1px solid #e0e0e0;
      background-color: #fff;

      .job-list {
        margin: 20px 15px;
      }

      .search-bar {
        margin: 0 15px 20px 15px;
      }

      .app-list {
        flex: 1;
        overflow-y: auto;

        .application {
          display: block;
          border-right: 4px solid transparent;

          .logo {
            margin-top: 12px;
            margin-left: 10px;
            float: left;
          }

          .content {
            padding: 8px 6px 8px 68px;

            > div:first-child {
              display: flex;
              align-items: center;
            }
            span {
              font-size: 12px;
              color: #656565;
            }

            .name {
              width: 100%;
              margin-bottom: 0;
              font-size: 14px;
              font-weight: 500;
            }
            .date {
              text-align: right;
              margin-left: 8px;
              float: right;
            }
            .sub-title {
              font-size: 12px;
            }
          }

          + .application::before {
            content: '';
            display: block;
            margin: 0 10px;
            border-top: 1px solid #f0f0f0;
          }

          &.deleted {
            opacity: 0.6;
            font-style: italic;
            text-decoration-line: line-through;
          }

          &.selected {
            border-right-color: #00b6a4;
            background-color: #f0f0f0;
            .name {
              color: #00b6a4;
            }
          }

          :hover {
            .name {
              color: #00b6a4;
            }
          }
        }
      }
    }

    .thread-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      margin-left: 300px;

      .toggle {
        display: none;
      }

      .thread-header {
        border-bottom: 1px solid #e0e0e0;
        padding: 14px 25px;
        min-height: 75px;

        button {
          width: 40px;
          font-size: 20px;
        }

        > div {
          display: flex;
          flex-direction: column;
          justify-content: center;

          .title {
            font-size: 16px;
            font-weight: 600;
            color: #ff9300;
          }
        }
      }
    }

    @media (max-width: 767px) {
      position: initial;

      .sidebar {
        left: -300px;
        transition: left ease 0.5s;
        z-index: 2;
      }

      .thread-container {
        margin-left: 0;

        .toggle {
          display: inline-block;
          padding: 12px;
          margin-left: -12px;
          margin-right: 12px;
          float: left;
        }
      }

      &.opened {
        .mask {
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0;
          right: 0;
          background-color: rgba(0, 0, 0, 0.5);
          z-index: 1;
        }

        .sidebar {
          left: 0;
        }
      }
    }
  }
`;
