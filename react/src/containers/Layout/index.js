import React from 'react';
import { connect } from 'react-redux';
import { Layout, Alert } from 'antd';

import Header from './components/Header';
import Footer from './components/Footer';

const MainLayout = ({ menu, banners, content: Content, visibleFooter, shareUrl, helpUrl, ...rest }) => {
  const headerKey = rest.location.pathname.split('/')[2];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header selectedKey={headerKey} menu={menu} shareUrl={shareUrl} />

      <Layout style={{ position: 'relative', marginTop: '50px' }}>
        {!!banners.length && (
          <div className="container" style={{ marginTop: '10px' }}>
            {banners.map(({ id, ...props }) => <Alert key={id} style={{ marginBottom: '10px' }} {...props} />)}
          </div>
        )}

        <Content {...rest} />
      </Layout>

      {visibleFooter && <Footer helpUrl={helpUrl || 'https://www.myjobpitch.com/what-is-my-job-pitch/'} />}
    </Layout>
  );
};

export default connect(state => ({
  banners: state.common.banners || [],
  visibleFooter: state.common.visibleFooter
}))(MainLayout);
