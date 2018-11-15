import styled from 'styled-components';

import media from 'utils/mediaquery';

export default styled.div`
  .ant-tabs-nav-container {
    font-size: 12px;
    font-weight: 500;
  }

  .ant-tabs-tabpane {
    display: flex;
    justify-content: center;
    padding: 40px 0;
    ${media.tablet`padding: 25px 10px;`};
  }
`;
