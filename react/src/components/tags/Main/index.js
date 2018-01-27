import styled from 'styled-components';
import media from 'utils/mediaquery';

export default styled.main`
  position: relative;
  flex: 1;
  display: flex;
  padding: 30px 0;
  ${media.tablet`padding: 15px 0;`};
  margin-top: 50px;
  background-color: #f9f9f9;

  > .container {
    display: flex;
    flex-direction: column;
  }
`;
