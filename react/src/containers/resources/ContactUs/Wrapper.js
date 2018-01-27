import { Main } from 'components';
import media from 'utils/mediaquery';

export default Main.extend`
  .container {
    > div {
      margin: 15px 0;
      ${media.tablet`margin-top: 8px;`};
    }
  }

  h1 {
    font-size: 24px;
    margin-bottom: 25px;
    ${media.tablet`margin-bottom: 20px;`};
  }

  .content {
    display: flex;

    .map {
      width: 300px;
      height: 300px;
      margin-right: 30px;
    }

    h4 {
      margin-bottom: 10px;
    }
  }

  @media (max-width: 767px) {
    .content {
      display: block;

      .map {
        margin-right: 0;
        margin-bottom: 30px;
      }
    }
  }
`;
