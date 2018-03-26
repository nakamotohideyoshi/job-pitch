import styled from 'styled-components';
import media from 'utils/mediaquery';
import { Container } from 'components';

export default styled(Container)`
  .content {
    position: relative;
    padding: 40px 0;
    ${media.tablet`padding: 25px 10px;`};
  }
`;
