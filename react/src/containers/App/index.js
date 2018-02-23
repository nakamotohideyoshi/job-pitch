import React from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { withRouter, Route } from 'react-router-dom';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import NotificationSystem from 'react-notification-system';

import { Loading } from 'components';
import { confirm } from 'redux/common';
import media from 'utils/mediaquery';
import * as helper from 'utils/helper';

import Routers from './Routers';
import Header from './Header';
import Footer from './Footer';

const RootWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;

  main {
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
  }
`;

class ScrollToTop extends React.PureComponent {
  render() {
    window.scrollTo(0, 0);
    return null;
  }
}

class App extends React.Component {
  render() {
    const { loginState, confirm, confirmInfo } = this.props;

    if (!loginState) {
      return <Loading />;
    }

    return (
      <RootWrapper>
        <Header />
        <main>
          <Route component={ScrollToTop} />
          <Routers />
        </main>
        <Footer />

        {confirmInfo && (
          <Modal isOpen toggle={confirm}>
            <ModalHeader toggle={confirm}>{confirmInfo.title}</ModalHeader>
            <ModalBody>{confirmInfo.message}</ModalBody>
            <ModalFooter>
              {confirmInfo.buttons.map((info, index) => (
                <Button
                  key={index}
                  color={info.color || 'gray'}
                  outline={info.outline}
                  onClick={() => {
                    confirm();
                    if (info.onClick) {
                      info.onClick();
                    }
                  }}
                  style={{ minWidth: '100px' }}
                >
                  {info.label || 'Cancel'}
                </Button>
              ))}
            </ModalFooter>
          </Modal>
        )}

        <NotificationSystem ref={ref => helper.setNotifSystem(ref)} />
      </RootWrapper>
    );
  }
}

export default withRouter(
  connect(
    state => ({
      loginState: state.auth.loginState,
      confirmInfo: state.common.confirmInfo
    }),
    { confirm }
  )(App)
);
