import React, { Fragment } from 'react';
import { Layout } from 'antd';
import Responsive from 'react-responsive';
import styled from 'styled-components';

import { Icons } from 'components';
import titleImage from 'assets/title.png';
import Popover from './Popover';
import UserMenu from './UserMenu';

const Wrapper = styled(Layout.Header)`
  position: fixed;
  width: 100%;
  z-index: 100;

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
      <div className="container">
        {Menu && <Responsive maxWidth={767}>{<Popover float="left" icon={Icons.Bars} menu={Menu} />}</Responsive>}

        <div className="title-logo">
          <img src={titleImage} alt="" />
        </div>

        {Menu && (
          <Fragment>
            <Responsive minWidth={768}>
              <Menu theme="dark" mode="horizontal" />
            </Responsive>
            <Popover float="right" menu={UserMenu} icon={Icons.UserCircle} />
          </Fragment>
        )}
      </div>
    </Wrapper>
  );
};
