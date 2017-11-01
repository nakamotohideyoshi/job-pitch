import React, { Component } from 'react';
import Helmet from 'react-helmet';
import AWS from 'aws-sdk';
import Button from 'react-bootstrap/lib/Button';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import VideoRecorder from 'components/VideoRecorder/VideoRecorder';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import styles from './PitchRecord.scss';

export default class PitchRecord extends Component {

  constructor(props) {
    super(props);
    this.api = ApiClient.shared();
    const pitch = this.api.jobSeeker.pitches[0];
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

  showCamera = () => this.setState({ showCamera: true });

  hideCamera = (videoUrl, recordedData) => {
    const newState = { showCamera: false };

    if (videoUrl) {
      newState.recordedData = recordedData;
      newState.videoUrl = videoUrl;
    }

    this.setState(newState);
  }

  uploadFile = () => {
    this.setState({ uploading: true });

    this.api.createPitch().then(pitch => {
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
        // Key: `https:www.sclabs.co.uk/${pitch.token}.${pitch.id}.${new Date().getTime()}`,
        Key: `http:localhost:8080/${pitch.token}.${pitch.id}.${new Date().getTime()}`,
        Body: this.state.recordedData
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
    this.api.getPitch(pitchId).then(pitch => {
      if (!pitch.video) {
        this.timer = setTimeout(() => this.checkPitch(pitchId), 2000);
      } else {
        utils.successNotif('Uploaded!');
        this.timer = null;
        this.setState({
          recordedData: null,
          progress: null,
          uploading: false,
        });
      }
    }).catch(() => {
      this.timer = setTimeout(() => this.checkPitch(pitchId), 2000);
    });
  }

  render() {
    const { videoUrl, recordedData, showCamera, uploading, progress } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="Record Pitch" />

        <div className="container">
          <div className="pageHeader">
            <h3>Record Pitch</h3>
          </div>

          <div className="board shadow padding-45">
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
                recordedData &&
                <Button
                  bsStyle="warning"
                  disabled={uploading}
                  onClick={this.uploadFile}
                >
                  <i className="fa fa-upload" />{uploading ? 'Uploading...' : 'Upload'}
                </Button>
              }
            </div>
          </div>
          {
            showCamera &&
            <VideoRecorder onClose={this.hideCamera} />
          }
        </div>
      </div>
    );
  }
}
