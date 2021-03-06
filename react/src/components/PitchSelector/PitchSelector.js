import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Upload, message, Tooltip } from 'antd';

import * as helper from 'utils/helper';
import { VideoPlayerModal, VideoRecorder, Icons, LinkButton } from 'components';
import Wrapper from './PitchSelector.styled';

const { confirm } = Modal;

class PitchSelector extends React.Component {
  state = {
    url: null,
    playUrl: null,
    showRecorder: false
  };

  playPitch = playUrl => this.setState({ playUrl });

  openRecorder = event => {
    event.stopPropagation();

    if (navigator.userAgent.indexOf('iPhone') !== -1) {
      confirm({
        title: 'To record your video, you need to download the app',
        okText: 'Download',
        maskClosable: true,
        onOk: () => {
          window.open('https://itunes.apple.com/us/app/myjobpitch-job-matching/id1124296674?ls=1&mt=8', '_blank');
        }
      });
    } else {
      this.setState({ showRecorder: true });
    }
  };

  closeRecorder = (videoUrl, videoData) => {
    const url = videoUrl || this.state.url;
    const data = videoData || this.state.data;
    this.setState({ url, showRecorder: false });
    this.props.onChange(data);
  };

  setPitchFile = ({ file, fileList }) => {
    if (file.type !== 'video/mp4' && file.type !== 'video/avi' && file.type !== 'video/quicktime') {
      message.error('You can only upload mp4, avi, mov file!');
      return;
    }

    if (file.size > 10000000) {
      message.error('You can only upload file less than 10MB!');
      return;
    }

    helper.getBase64(file, url => {
      this.setState({ url });
      this.props.onChange(file);
    });
  };

  removeVideo = () => {
    this.setState({ url: null });
    this.props.onChange();
  };

  render() {
    const { currentPitch } = this.props;
    const { video, thumbnail } = currentPitch || {};
    const { playUrl, showRecorder, url } = this.state;

    return (
      <Wrapper>
        <div className="buttons">
          {video && (
            <Tooltip placement="bottom" title="Current Pitch">
              <div className="currentPitch" onClick={() => this.playPitch(video)}>
                <div className="thumbnail" style={{ backgroundImage: `url(${thumbnail})` }} />
                <span className="play-icon" />
              </div>
            </Tooltip>
          )}

          <Upload.Dragger
            className="newPitch"
            showUploadList={false}
            beforeUpload={() => false}
            onChange={this.setPitchFile}
          >
            <p className="ant-upload-text">
              <Icons.CloudUpload /> Click or drag to upload video file
            </p>
            <p className="ant-upload-hint">
              or you can record <LinkButton onClick={this.openRecorder}>New Video</LinkButton>
            </p>
            {/* <Dropdown
              overlay={
                <Menu onSelect={e => {}}>
                  <Menu.Item key="0">
                    <a
                      onClick={e => {
                        e.stopPropagation();
                      }}
                    >
                      1st menu item
                    </a>
                  </Menu.Item>
                </Menu>
              }
              trigger={['click']}
              onClick={e => {
                console.log(444);
                e.stopPropagation();
              }}
            >
              <LinkButton className="ant-dropdown-link">Click me</LinkButton>
            </Dropdown> */}
          </Upload.Dragger>
        </div>

        {url && (
          <div className="newInfo">
            <LinkButton onClick={() => this.playPitch(url)}>New video</LinkButton>
            {' save to upload and click '}
            <LinkButton onClick={this.removeVideo}>here</LinkButton>
            {' to cancel'}
          </div>
        )}

        {showRecorder && <VideoRecorder onClose={this.closeRecorder} />}
        {playUrl && (
          <VideoPlayerModal
            autoplay
            controls
            sources={[
              {
                src: playUrl,
                type: 'video/mp4'
              }
            ]}
            onClose={() => this.playPitch()}
          />
        )}
      </Wrapper>
    );
  }
}

PitchSelector.propTypes = {
  onChange: PropTypes.func.isRequired,
  currentPitch: PropTypes.object
};

PitchSelector.defaultProps = {
  currentPitch: null
};

export default PitchSelector;
