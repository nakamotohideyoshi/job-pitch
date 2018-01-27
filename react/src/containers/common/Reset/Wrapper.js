import { Main } from 'components';

export default Main.extend`
  .container {
    padding-top: 30px;
    align-items: center;
  }

  .board {
    width: 100%;
    max-width: 350px;

    hr {
      margin-bottom: 25px;
    }

    form {
      button {
        margin-top: 25px;
      }
    }
  }
`;
