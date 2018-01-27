import { Main } from 'components';

export default Main.extend`
  text-align: center;

  h2 {
    margin-bottom: 25px;
    text-align: left;
  }

  .container {
    width: 100% !important;
    max-width: 720px !important;
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
      i {
        margin-right: 10px;
      }
    }
  }
`;
