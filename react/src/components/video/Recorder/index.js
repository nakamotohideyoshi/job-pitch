import React from 'react';
import styled from 'styled-components';
import { Modal } from 'antd';
import { VideoPlayer } from 'components';
import RecordModal from './RecordModal';

const { confirm } = Modal;

const Info = styled.div`
  margin-top: 7px;
  line-height: initial;
  color: #8c8c8c;

  a {
    color: #595959;
    text-decoration: underline;
  }
`;

class VideoRecorder extends React.Component {
  state = {
    url: null,
    data: null,
    showRecorder: false,
    showPlayer: false
  };

  openRecorder = () => {
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
    this.setState({ url, data, showRecorder: false });
    this.props.onChange(url, data);
  };

  removeVideo = () => {
    this.setState({ url: null, data: null });
    this.props.onChange();
  };

  openPlayer = () => this.setState({ showPlayer: true });
  closePlayer = () => this.setState({ showPlayer: false });

  render() {
    const { showInfo, buttonComponent: Button } = this.props;
    const { url, showRecorder, showPlayer } = this.state;
    return (
      <div>
        <Button onClick={this.openRecorder} />

        {showInfo &&
          url && (
            <Info>
              <a onClick={this.openPlayer}>New video</a>
              {' save to upload and click '}
              <a onClick={this.removeVideo}>here</a>
              {' to cancel'}
            </Info>
          )}

        {showRecorder && <RecordModal onClose={this.closeRecorder} />}
        {showPlayer && <VideoPlayer videoUrl={url} onClose={this.closePlayer} />}
      </div>
    );
  }
}

export default VideoRecorder;
