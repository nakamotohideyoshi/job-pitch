import styled from 'styled-components';
import { Container } from 'components';
import media from 'utils/mediaquery';

export default styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 80px 0;

  form {
    width: 100%;
    max-width: 400px;
    padding: 40px 60px;
    ${media.tablet`padding: 20px 30px;`};
    background-color: #fff;

    > h1 {
      text-align: center;
      margin-bottom: 25px;
    }

    .ant-form-item:last-child {
      margin-bottom: 0;
    }

    button {
      width: 100%;
    }
  }
`;
