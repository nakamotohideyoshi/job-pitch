import styled from 'styled-components';
import media from 'utils/mediaquery';

export const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 20px 0;

  h2 {
    margin: 0;
    font-size: 1.75rem;
    font-weight: 500;
  }
`;

export const PageSubHeader = styled.div`
  ${media.notmobile`
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 15px;
  `};

  ${media.mobile`
    > * {
      display: block;
      width: 100% !important;
      margin: 0 0 15px 0 !important;
    };
  `};
`;
