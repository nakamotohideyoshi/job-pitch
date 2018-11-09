import styled from 'styled-components';

import media from 'utils/mediaquery';

export default styled.div`
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

    label {
      color: rgba(0, 0, 0, 0.85);
      line-height: 40px;
    }

    button {
      width: 100%;
    }

    a {
      float: right;
    }
  }

  > div {
    margin-top: 20px;
  }
`;
