import styled from 'styled-components';
import media from 'utils/mediaquery';
import { Modal } from 'reactstrap';

export default styled(Modal)`
  .modal-body {
    background-color: #f9f9f9;
    padding: 30px;
    ${media.tablet`padding: 15px;`};

    .main-board,
    .contact-board {
      padding: 30px;
      ${media.tablet`padding: 20px;`};
    }

    .info {
      display: flex;

      .content {
        flex: 1;
        margin-left: 30px;
        ${media.tablet`margin-left: 20px;`};

        .name {
          display: flex;
          align-items: flex-start;

          h4 {
            flex: 1;
            margin-bottom: 8px;
          }

          .loading {
            position: relative;
            width: 100px;
            height: 20px;
          }
          .shortlisted {
            margin-top: 2px;
            margin-left: 15px;
          }
        }

        .attributes {
          span {
            label {
              margin-bottom: 8px;
              color: #808080;
            }
          }

          span + span {
            margin-left: 20px;
          }
        }

        a {
          display: inline-flex;
          align-items: center;
          color: #333;
          padding: 0;
          font-size: 15px;
          cursor: pointer;

          i {
            color: #00b6a4;
            font-size: 30px;
            margin-right: 5px;
          }
        }
      }
    }

    hr {
      margin: 30px 0;
      ${media.tablet`margin: 20px 0;`};
    }

    .overview,
    .contact-board {
      h4 {
        margin-bottom: 25px;
        ${media.tablet`margin-bottom: 15px;`};
      }
    }

    .overview {
      margin-bottom: 25px;
      ${media.tablet`margin-top: 15px;`};

      div {
        white-space: pre-line;
      }

      button {
        width: 100px;
        margin-top: 20px;
        ${media.tablet`margin-top: 10px;`};
      }
    }

    .check-label {
      display: flex;
      margin-top: 0.5rem;

      i {
        margin-right: 0.5rem;
        font-size: 1.5rem;
        color: #ff9300;
      }
    }

    .contact-board {
      margin-top: 30px;
      padding: 30px;
      ${media.tablet`
        margin-top: 15px;
        padding: 20px;
      `};

      label {
        width: 70px;
        color: #808080;
      }
    }
  }

  .modal-footer {
    justify-content: space-between;
    padding: 20px 30px;
    ${media.tablet`padding: 20px 20px;`};

    .btn {
      min-width: 100px;
    }

    .btn + .btn {
      margin-left: 7px;
    }
  }
`;
