import styled from 'styled-components';
import { Container } from 'reactstrap';

export default styled(Container)`
  h2 {
    margin-bottom: 25px;
  }

  .cv-buttons {
    margin-top: 10px;
  }

  .alert-info {
    margin-top: 10px;
    margin-bottom: 0;
    a {
      cursor: pointer;
      font-weight: 600;
      text-decoration: underline !important;
    }
  }

  .btn + .btn {
    margin-left: 15px;
  }

  .btn-lg {
    width: 140px;
  }
`;

export const WithPublic = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;
