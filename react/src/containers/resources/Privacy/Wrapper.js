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
`;
