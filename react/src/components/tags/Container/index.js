import styled from 'styled-components';

export default styled.div`
  width: 100%;
  @media (max-width: 767px) {
    max-width: 100%;
  }
  @media (min-width: 768px) {
    max-width: 720px;
  }
  @media (min-width: 992px) {
    max-width: 960px;
  }

  padding-right: 15px;
  padding-left: 15px;
  margin-right: auto;
  margin-left: auto;
`;
