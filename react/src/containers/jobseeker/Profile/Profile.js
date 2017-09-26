import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import AWS from 'aws-sdk';
import { Loading, FormComponent } from 'components';
import VideoRecorder from 'components/VideoRecorder/VideoRecorder';
import * as commonActions from 'redux/modules/common';
import * as apiActions from 'redux/modules/api';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import styles from './Profile.scss';

@connect(
  () => ({
  }),
  { ...commonActions, ...apiActions })
export default class Profile extends FormComponent {
  static propTypes = {
    saveJobSeekerAction: PropTypes.func.isRequired,
    getPitchAction: PropTypes.func.isRequired,
    createPitchAction: PropTypes.func.isRequired,
    setPermission: PropTypes.func.isRequired,
  }

  componentDidMount() {
    this.getJobSeeker().then(jobSeeker => {
      const formModel = Object.assign({}, jobSeeker);
      formModel.sex = ApiClient.sexes.filter(item => item.id === jobSeeker.sex)[0];
      formModel.nationality = ApiClient.nationalities.filter(item => item.id === jobSeeker.nationality)[0];
      this.setState({ jobSeeker, formModel });
    });
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onViewCV = () => {
    window.open(this.state.jobSeeker.cv);
  }

  onOpenBrowser = () => this.dropzoneRef.open();

  onChangedCV = files => {
    this.cv = files[0];
    this.setState({
      cvComment: 'CV added: save to upload.'
    });
  }

  onRemovedCV = () => {
    this.cv = null;
    this.setState({
      cvComment: ''
    });
  }

  onShowRecorder = () => {
    this.setState({
      isRecorder: true
    });
  }

  onShowPlayer = () => {
    this.setState({
      isPlayer: true,
    });
  }

  onHideDialog = (url, videoData) => {
    this.videoData = videoData;
    this.setState({
      isRecorder: false,
      isPlayer: false,
    });
  }

  getJobSeeker = () => {
    if (ApiClient.jobSeeker) {
      return Promise.resolve(ApiClient.jobSeeker);
    }
    return Promise.resolve({
      active: true,
      email_public: true,
      telephone_public: true,
      mobile_public: true,
      age_public: true,
      sex_public: true,
      nationality_public: true,
      email: localStorage.getItem('email')
    });
  }

  onSave = () => {
    if (!this.isValid(['first_name', 'last_name', 'description'])) return;

    const { formModel } = this.state;
    if (!formModel.truth_confirmation) {
      this.setState({
        errors: {
          detail: 'You must check the box confirming the truth of the information you have provided.'
        }
      });
      return;
    }

    const { saveJobSeekerAction, setPermission } = this.props;
    const data = Object.assign(this.state.jobSeeker, formModel);
    data.sex = formModel.sex && formModel.sex.id;
    data.nationality = formModel.nationality && formModel.nationality.id;
    data.cv = this.cv;

    saveJobSeekerAction(data).then(jobSeeker => {
      const cvComment = this.cv ? 'CV added.' : '';
      this.cv = null;
      this.setState({ jobSeeker, cvComment });
      setPermission(jobSeeker.profile ? 2 : 1);
      if (this.videoData) {
        this.uploadFile();
      } else {
        utils.successNotif('Success!');
      }
    })
    .catch(errors => this.setState({ errors }));
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
      s3.upload({
        Bucket: 'mjp-android-uploads',
        Key: `https:www.sclabs.co.uk/${pitch.token}.${pitch.id}.${new Date().getTime()}`,
        Body: this.videoData,
        ContentType: 'video/webm',
      }, (err, data) => {
        if (err) {
          this.setState({
            progress: null,
            uploading: false,
          });
          utils.errorNotif('Upload Failed!');
        } if (data) {
          console.log(data);
          this.checkPitch(pitch.id);
        }
      }).on('httpUploadProgress', progress => {
        this.setState({
          progress: Math.floor((progress.loaded / progress.total) * 100),
        });
      });
    });
  }

  checkPitch = (pitchId) => {
    this.props.getPitchAction(pitchId).then(pitch => {
      if (!pitch.video) {
        this.timer = setTimeout(() => this.checkPitch(pitchId), 2000);
      } else {
        utils.successNotif('Success!');
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
    const { jobSeeker, cvComment, isRecorder, isPlayer, saving, progress, uploading } = this.state;
    const pitch = jobSeeker && jobSeeker.pitches ? jobSeeker.pitches[0] : null;
    const videoUrl = pitch ? pitch.video : null;

    if (!jobSeeker) {
      return <Loading />;
    }

    return (
      <div className={styles.root}>
        <Helmet title="Profile" />

        <div className="container">
          <div className="pageHeader">
            <h3>Profile</h3>
          </div>

          <div className="shadow-board padding-45">
            <Form>
              <FormGroup className={styles.active}>
                <ControlLabel>Active</ControlLabel>
                <this.CheckBoxField label="" name="active" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>First Name</ControlLabel>
                <this.TextField type="text" name="first_name" />
              </FormGroup>
              <FormGroup>
                <ControlLabel>Last Name</ControlLabel>
                <this.TextField type="text" name="last_name" />
              </FormGroup>
              <FormGroup>
                <div className={styles.checkLabel}>
                  <ControlLabel>Email</ControlLabel>
                  <this.CheckBoxField label="Public" name="email_public" />
                </div>
                <this.TextField type="email" name="email" disabled />
              </FormGroup>
              <FormGroup>
                <div className={styles.checkLabel}>
                  <ControlLabel>Telephone</ControlLabel>
                  <this.CheckBoxField label="Public" name="telephone_public" />
                </div>
                <this.TextField type="text" name="telephone" />
              </FormGroup>
              <FormGroup>
                <div className={styles.checkLabel}>
                  <ControlLabel>Mobile</ControlLabel>
                  <this.CheckBoxField label="Public" name="mobile_public" />
                </div>
                <this.TextField type="text" name="mobile" />
              </FormGroup>
              <FormGroup>
                <div className={styles.checkLabel}>
                  <ControlLabel>Age</ControlLabel>
                  <this.CheckBoxField label="Public" name="age_public" />
                </div>
                <this.TextField type="number" name="age" />
              </FormGroup>
              <FormGroup>
                <div className={styles.checkLabel}>
                  <ControlLabel>Gender</ControlLabel>
                  <this.CheckBoxField label="Public" name="sex_public" />
                </div>
                <this.SelectField
                  placeholder="Select Gender"
                  name="sex"
                  dataSource={ApiClient.sexes}
                />
              </FormGroup>
              <FormGroup>
                <div className={styles.checkLabel}>
                  <ControlLabel>Nationality</ControlLabel>
                  <this.CheckBoxField label="Public" name="nationality_public" />
                </div>
                <this.SelectField
                  placeholder="Select Nationality"
                  name="nationality"
                  dataSource={ApiClient.nationalities}
                  searchable
                  searchPlaceholder="Search"
                />
              </FormGroup>
              <FormGroup>
                <ControlLabel>CV</ControlLabel>
                <this.TextField componentClass="textarea" name="description" />
                <div className={styles.cvContainer}>
                  {
                    jobSeeker.cv && <Button onClick={this.onViewCV}>View CV</Button>
                  }
                  <Button onClick={this.onOpenBrowser}>Upload CV</Button>
                  <div>{cvComment}</div>
                  {
                    this.cv && (<button
                      type="button"
                      className="fa fa-times btn-icon"
                      onClick={this.onRemovedCV}
                    />)
                  }
                  <Dropzone
                    ref={node => { this.dropzoneRef = node; }}
                    multiple={false}
                    onDrop={this.onChangedCV}
                    className="h"
                  >
                  </Dropzone>
                </div>
              </FormGroup>
              <FormGroup>
                <ControlLabel>Video Pitch</ControlLabel>
                <div>
                  <Button
                    style={{ marginBottom: '10px', marginRight: '10px' }}
                    onClick={this.onShowRecorder}
                  >Record New</Button>
                  {
                    videoUrl &&
                    <Button
                      style={{ marginBottom: '10px', marginRight: '10px' }}
                      onClick={this.onShowPlayer}
                    >Play Current</Button>
                  }
                </div>
              </FormGroup>
              <FormGroup>
                <this.CheckBoxField
                  label="References Available"
                  name="has_references"
                />
                <br /><br />
                <this.CheckBoxField
                  label="All of the information provided is truthful to the best of my knowledge."
                  name="truth_confirmation"
                />
              </FormGroup>
              {
                progress &&
                <FormGroup>
                  <Col smOffset={2} sm={10}>
                    <ProgressBar
                      style={{ marginBottom: '0' }}
                      striped
                      bsStyle="danger"
                      now={progress}
                      label={`${progress}%`}
                    />
                  </Col>
                </FormGroup>
              }
            </Form>
            <div className={styles.footer}>
              <this.SubmitButton
                submtting={saving || uploading}
                labels={['Save', 'Saving...']}
                onClick={this.onSave}
              />
            </div>
          </div>
          {
            isRecorder &&
            <VideoRecorder
              onClose={this.onHideDialog}
            />
          }
          {
            isPlayer &&
            <VideoRecorder
              videoUrl={videoUrl}
              onClose={this.onHideDialog}
            />
          }
        </div>
      </div>
    );
  }
}
