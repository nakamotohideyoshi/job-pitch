import React from 'react';
import { Modal, Upload, message, Tooltip } from 'antd';

import * as helper from 'utils/helper';

import { VideoPlayer, Icons } from 'components';
import RecordModal from '../video/Recorder/RecordModal';
import Wrapper from './styled';

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
        content: 'To record your video, you need to download the app',
        okText: 'Sign out',
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

  setPitchFile = ({ file }) => {
    if (file.type !== 'video/mp4') {
      message.error('You can only upload MP4 file!');
      return;
    }

    const data = file.originFileObj;
    helper.getBase64(data, url => {
      this.setState({ url });
      this.props.onChange(data);
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
                <div className="mask">
                  <Icons.PlayCircle />
                </div>
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
              <Icons.Upload /> Click or drag to upload video file
            </p>
            <p className="ant-upload-hint">
              or you can record <a onClick={this.openRecorder}>New Video</a>
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
              <a className="ant-dropdown-link">Click me</a>
            </Dropdown> */}
          </Upload.Dragger>
        </div>

        {url && (
          <div className="newInfo">
            <a onClick={() => this.playPitch(url)}>New video</a>
            {' save to upload and click '}
            <a onClick={this.removeVideo}>here</a>
            {' to cancel'}
          </div>
        )}

        {showRecorder && <RecordModal onClose={this.closeRecorder} />}
        {playUrl && <VideoPlayer videoUrl={playUrl} onClose={() => this.playPitch()} />}
      </Wrapper>
    );
  }
}

export default PitchSelector;
