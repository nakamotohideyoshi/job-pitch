import styled from 'styled-components';
import { Menu } from 'antd';
import media from 'utils/mediaquery';

export const TabMenu = styled(Menu)`
  background: transparent;
  line-height: 38px;
  font-size: 12px;
  font-weight: 500;
`;

export const Content = styled.div`
  display: flex;
  justify-content: center;
  padding: 40px 0;
  ${media.tablet`padding: 25px 10px;`};
`;
