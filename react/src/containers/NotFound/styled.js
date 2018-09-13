import styled from 'styled-components';
import colors from 'utils/colors';

export default styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;

  img {
    margin-top: 100px;
  }

  h1 {
    margin-top: 40px;
    padding: 0 15px;
  }

  div {
    padding: 0 15px;
  }

  a {
    color: ${colors.green} !important;
  }

  p {
    margin-top: 80px;
  }
`;
