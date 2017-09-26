import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Helmet from 'react-helmet';
import AWS from 'aws-sdk';
import VideoRecorder from 'components/VideoRecorder/VideoRecorder';
import Button from 'react-bootstrap/lib/Button';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './PitchRecord.scss';

@connect(
  () => ({
  }),
  { ...apiActions }
)
export default class PitchRecord extends Component {
  static propTypes = {
    getPitchAction: PropTypes.func.isRequired,
    createPitchAction: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    const pitch = ApiClient.jobSeeker.pitches[0];
    this.state = {
      videoUrl: pitch ? pitch.video : '',
    };
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    if (this.upload) {
      this.upload.abort.bind(this.upload);
    }
  }

  showCamera = () => {
    this.setState({
      isRecording: true
    });
  }

  hideCamera = (url, videoData) => {
    this.videoData = videoData;
    this.setState({
      recoreded: !!url,
      videoUrl: url || this.state.videoUrl,
      isRecording: false,
    });
  }

  uploadFile = () => {
    this.setState({
      uploading: true,
    });

    this.props.createPitchAction().then(pitch => {
      const s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        credentials: new AWS.CognitoIdentityCredentials({
          IdentityPoolId: 'eu-west-1:93ae6986-5938-4130-a3c0-f96c39d75be2',
        }, {
          region: 'eu-west-1',
        }),
      });
      this.upload = s3.upload({
        Bucket: 'mjp-android-uploads',
        Key: `https:www.sclabs.co.uk/${pitch.token}.${pitch.id}.${new Date().getTime()}`,
        Body: this.videoData
      });
      this.upload.on('httpUploadProgress', progress => {
        if (this.upload) {
          this.setState({
            progress: Math.floor((progress.loaded / progress.total) * 100),
          });
        }
      });
      this.upload.send((err, data) => {
        if (this.upload) {
          this.upload = null;
          if (err) {
            console.log(err);
            this.setState({
              progress: null,
              uploading: false,
            });
            utils.errorNotif('Upload Failed!');
          } if (data) {
            console.log(data);
            this.checkPitch(pitch.id);
          }
        }
      });
    });
  }

  checkPitch = (pitchId) => {
    this.props.getPitchAction(pitchId).then(pitch => {
      if (!pitch.video) {
        this.timer = setTimeout(() => this.checkPitch(pitchId), 2000);
      } else {
        utils.successNotif('Uploaded!');
        this.timer = null;
        this.videoData = null;
        this.setState({
          recoreded: false,
          progress: null,
          uploading: false,
        });
      }
    }).catch(() => {
      this.timer = setTimeout(() => this.checkPitch(pitchId), 2000);
    });
  }

  render() {
    const { videoUrl, recoreded, isRecording, uploading, progress } = this.state;
    return (
      <div className={styles.root}>
        <Helmet title="Record Pitch" />

        <div className="container">
          <div className="pageHeader">
            <h3>Record Pitch</h3>
          </div>

          <div className="shadow-board padding-45">
            <div className={styles.container}>
              <div className={styles.help}>
                {`Here you can record your 30 second pitch. The 30 sec.\n
                  video will be viewed by prospective employers.`}
              </div>
              <video
                className={styles.player}
                preload="auto"
                controls={!!videoUrl}
                src={videoUrl}
              >
                <track kind="captions" />
              </video>
              {
                progress &&
                <ProgressBar
                  className={styles.progress}
                  striped
                  bsStyle="danger"
                  now={progress}
                  label={`${progress}%`}
                />
              }
              <div className={styles.buttons}>
                <Button
                  bsStyle="success"
                  disabled={uploading}
                  onClick={this.showCamera}
                >Record New Pitch</Button>
                {
                  recoreded &&
                  <Button
                    bsStyle="warning"
                    disabled={uploading}
                    onClick={this.uploadFile}
                  ><i className="fa fa-upload" />{uploading ? 'Uploading...' : 'Upload'}</Button>
                }
              </div>
            </div>
          </div>
          {
            isRecording &&
            <VideoRecorder onClose={this.hideCamera} />
          }
        </div>
      </div>
    );
  }
}
