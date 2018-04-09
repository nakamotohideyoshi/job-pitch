import React, { Fragment } from 'react';
import { Layout } from 'antd';
import Responsive from 'react-responsive';
import faBars from '@fortawesome/fontawesome-free-solid/faBars';
import faUserCircle from '@fortawesome/fontawesome-free-solid/faUserCircle';
import styled from 'styled-components';

import { Container } from 'components';
import Popover from './Popover';
import UserMenu from './UserMenu';
import titleImage from 'assets/title.png';

const Wrapper = styled(Layout.Header)`
  position: fixed;
  width: 100%;
  z-index: 1000;

  .title-logo {
    float: left;
    margin: 0 24px -1px 10px;
  }

  .ant-menu {
    float: left;
    line-height: 50px;

    .ant-menu-item {
      padding: 0 16px;
    }
  }
`;

export default ({ menu: Menu }) => {
  return (
    <Wrapper className="shadow1">
      <Container>
        {Menu && <Responsive maxWidth={767}>{<Popover float="left" icon={faBars} menu={Menu} />}</Responsive>}

        <div className="title-logo">
          <img src={titleImage} alt="" />
        </div>

        {Menu && (
          <Fragment>
            <Responsive minWidth={768}>
              <Menu theme="dark" mode="horizontal" />
            </Responsive>
            <Popover float="right" menu={UserMenu} icon={faUserCircle} />
          </Fragment>
        )}
      </Container>
    </Wrapper>
  );
};
