import React from 'react';
import videojs from 'video.js';
import styled from 'styled-components';

const Wrapper = styled.div`
  position: relative;
  padding-top: 56%;
  width: 100%;

  .video-js {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    button {
      outline: none;
    }

    .vjs-big-play-button {
      top: 50%;
      left: 50%;
      margin-top: -0.6em;
      margin-left: -0.6em;
      width: 1.2em;
      height: 1.2em;
      border: none;
      border-radius: 50%;
      font-size: 8em;
      line-height: 1.2em;
      background-color: rgba(0, 0, 0, 0.2);
    }

    .vjs-error-display {
      display: none;
    }

    &:hover {
      .vjs-big-play-button {
        background-color: rgba(0, 0, 0, 0.4);
      }
    }
  }
`;

class VideoPlayer extends React.Component {
  componentDidMount() {
    const { className, ...props } = this.props;
    this.player = videojs(this.videoNode, props);
  }

  componentWillUnmount() {
    if (this.player) {
      this.player.dispose();
    }
  }

  componentWillReceiveProps(nextProps) {
    this.player.src(nextProps.sources);
    this.player.poster(nextProps.poster);
  }

  render() {
    return (
      <Wrapper className={this.props.className}>
        <video ref={node => (this.videoNode = node)} className="video-js" />
      </Wrapper>
    );
  }
}

export default VideoPlayer;
