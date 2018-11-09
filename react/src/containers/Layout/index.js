import React from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { Layout, Alert } from 'antd';

import Header from './Header';
import Footer from './Footer';

const RootLayer = styled(Layout)`
  min-height: 100vh !important;
`;

const Main = styled(Layout)`
  position: relative;
  margin-top: 50px;

  .banners {
    margin-top: 10px;

    .ant-alert {
      margin-top: 10px;
    }
  }
`;

const MainLayout = ({ banners, location, content: Content, ...rest }) => {
  const path2 = location.pathname.split('/')[2];

  return (
    <RootLayer>
      <Header />

      <Main>
        {!!banners.length && (
          <div className="container banners">
            {banners.map(({ id, ...props }) => (
              <Alert key={id} {...props} />
            ))}
          </div>
        )}

        <Content {...rest} />
      </Main>

      {path2 !== 'messages' && <Footer />}
    </RootLayer>
  );
};

export default connect(state => ({
  banners: state.common.banners
}))(MainLayout);
