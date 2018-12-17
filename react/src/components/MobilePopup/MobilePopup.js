import React from 'react';
import { PropTypes } from 'prop-types';
import { Modal, Button } from 'antd';
import MobileDetect from 'mobile-detect';
import Wrapper from './MobilePopup.styled';
import googlePlayBadge from '../../assets/google-play-badge.png';

const ANDROID_OS = 'AndroidOs';

class MobilePopup extends React.Component {
  state = {
    isModalVisible: false,
    isAndroid: false,
    isIOS: false
  };

  componentDidMount() {
    const md = new MobileDetect(window.navigator.userAgent);
    if (md.is(ANDROID_OS)) {
      this.setState({ isAndroid: true }, () => setTimeout(this._showPopup, 500));
    }
  }

  _showPopup = () => {
    this.setState({
      isModalVisible: true
    });
  };

  _handleCancel = () => {
    this.setState({
      isModalVisible: false
    });
  };

  render() {
    return (
      <Wrapper>
        <Modal
          visible={this.state.isModalVisible}
          title={
            <Wrapper>
              <div className={'modal-title-wrapper'}>
                <span>Download the My Job Pitch app on Google Play</span>
              </div>
            </Wrapper>
          }
          footer={[null, null]}
          className={'mobile-store-button'}
          onCancel={this._handleCancel}
        >
          <Wrapper>
            <div className={'google-play-badge'}>
              <a href="https://play.google.com/store/apps/details?id=com.myjobpitch&pcampaignid=MKT-Other-global-all-co-prtnr-py-PartBadge-Mar2515-1">
                <img alt="Get it on Google Play" src={googlePlayBadge} />
              </a>
              <div className={'to-web-btn-wrapper'}>
                <Button className={'to-web-btn'} type="primary" onClick={this._handleCancel}>
                  Continue to web
                </Button>
              </div>
            </div>
          </Wrapper>
        </Modal>
        {this.props.children}
      </Wrapper>
    );
  }
}

MobilePopup.propTypes = {
  children: PropTypes.node.isRequired
};

export default MobilePopup;
