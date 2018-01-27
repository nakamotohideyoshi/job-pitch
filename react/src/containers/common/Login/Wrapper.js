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

  .reset {
    margin-top: 10px;
    color: #00b6a4;
    float: right;
  }

  .signup {
    margin-top: 20px;
    a {
      color: #00b6a4;
    }
  }
`;
