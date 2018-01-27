import styled from 'styled-components';
import media from 'utils/mediaquery';
import { Modal } from 'reactstrap';

export default styled(Modal)`
  .modal-body {
    background-color: #f9f9f9;
    padding: 30px;
    ${media.tablet`padding: 15px;`};

    .main-board,
    .workplace-board {
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
        }

        .businessName {
          margin-bottom: 20px;
        }

        .attributes {
          span {
            label {
              margin-bottom: 0;
              color: #808080;
            }
          }

          span + span {
            margin-left: 20px;
          }
        }
      }
    }

    hr {
      margin: 30px 0;
      ${media.tablet`margin: 20px 0;`};
    }

    .overview,
    .workplace-board {
      h4 {
        margin-bottom: 25px;
        ${media.tablet`margin-bottom: 15px;`};
      }
    }

    .workplace-board .overview {
      margin-bottom: 25px;
      ${media.tablet`margin-top: 15px;`};
    }

    .overview {
      div {
        white-space: pre-line;
      }
    }

    .workplace-board {
      margin-top: 30px;
      padding: 30px;
      ${media.tablet`
        margin-top: 15px;
        padding: 20px;
      `};

      .map {
        position: relative;
        width: 100%;
        padding-top: 50%;
        margin-top: 10px;

        > div {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
        }
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
