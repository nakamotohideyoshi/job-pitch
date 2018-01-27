import styled from 'styled-components';
import { Modal } from 'reactstrap';
import media from 'utils/mediaquery';

export default styled(Modal)`
  .modal-body {
    padding: 2rem;
    ${media.tablet`padding: 1rem;`};
  }

  .videoContainer {
    position: relative;

    video {
      width: 100%;
      background-color: #000;
    }
  }

  .rec-button {
    position: absolute;
    width: 10%;
    padding-top: 10%;
    left: 0;
    right: 0;
    bottom: 5%;
    margin: auto;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.5);

    span {
      position: absolute;
      width: 40%;
      padding-top: 40%;
      top: 30%;
      left: 30%;
      background-color: red;
    }
  }

  .bar {
    div {
      position: absolute;
      width: 100%;
      height: 3px;
      left: 0;
      bottom: 4px;
      background-color: rgba(0, 0, 0, 0.5);
    }
    div:last-child {
      background-color: red;
    }
  }
`;
