import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
  text-align: center;
  width: 100% !important;
  max-width: 720px !important;

  h2 {
    margin-bottom: 25px;
    text-align: left;
  }

  .help {
    margin-bottom: 1rem;
    color: #959595;
    font-size: 16px;
    text-align: left;
  }

  .videoContainer {
    position: relative;

    video {
      width: 100%;
      background-color: #000;
    }

    div {
      width: 100%;
      padding-top: 75%;
      background-color: #000;
    }
  }

  .buttons {
    margin-top: 20px;
    button {
      width: 150px;
      margin: 6px 6px 0 6px;
      svg {
        margin-right: 10px;
      }
    }
  }
`;
