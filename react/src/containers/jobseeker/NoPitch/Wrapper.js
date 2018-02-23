import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 60px;
  text-align: center;

  > div {
    white-space: pre-line;
    padding-top: 20px;
  }

  > a {
    margin-top: 15px;
    color: #00b6a4;
    font-size: 16px;
  }
`;
