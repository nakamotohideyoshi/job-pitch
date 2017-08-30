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
import * as authActions from 'redux/modules/auth';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import styles from './Profile.scss';

@connect(
  state => ({
    jobSeeker: state.auth.jobSeeker,
    staticData: state.auth.staticData,
    loading: state.auth.loading,
  }),
  { ...authActions, ...commonActions })
export default class Profile extends FormComponent {
  static propTypes = {
    jobSeeker: PropTypes.object,
    staticData: PropTypes.object.isRequired,
    loading: PropTypes.bool.isRequired,
    saveJobSeeker: PropTypes.func.isRequired,
    setPermission: PropTypes.func.isRequired,
    createPitch: PropTypes.func.isRequired,
  }

  static defaultProps = {
    jobSeeker: null,
  }

  componentDidMount() {
    this.getJobSeeker()
    .then(jobSeeker => {
      const { staticData } = this.props;
      const formModel = Object.assign({}, jobSeeker);
      formModel.sex = staticData.sexes.filter(item => item.id === jobSeeker.sex)[0];
      formModel.nationality = staticData.nationalities.filter(item => item.id === jobSeeker.nationality)[0];
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
    if (this.props.jobSeeker) {
      return Promise.resolve(this.props.jobSeeker);
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

    const { saveJobSeeker, setPermission } = this.props;
    const data = Object.assign(this.state.jobSeeker, formModel);
    data.sex = formModel.sex && formModel.sex.id;
    data.nationality = formModel.nationality && formModel.nationality.id;
    data.cv = this.cv;

    saveJobSeeker(data).then(jobSeeker => {
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

    this.props.createPitch().then(pitch => {
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
    this.props.getPitch(pitchId).then(pitch => {
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
    const { staticData, loading } = this.props;
    const { jobSeeker, cvComment, isRecorder, isPlayer, progress, uploading } = this.state;
    const pitch = jobSeeker && jobSeeker.pitches ? jobSeeker.pitches[0] : null;
    const videoUrl = pitch ? pitch.video : null;
    return (
      <div>
        <Helmet title="Profile" />
        {
          !jobSeeker ?
            <Loading /> :
            <div>
              <div className="pageHeader">
                <h1>Profile</h1>
              </div>
              <div className="board">
                <Form horizontal>
                  <this.CheckBoxGroup
                    label="Active"
                    name="active"
                  />
                  <this.TextFieldGroup
                    type="text"
                    label="First Name"
                    name="first_name"
                  />
                  <this.TextFieldGroup
                    type="text"
                    label="Last Name"
                    name="last_name"
                  />
                  <this.TextFieldCheckGroup
                    type="email"
                    label="Email"
                    name="email"
                    disabled
                    checkLabel="Public"
                    checkName="email_public"
                  />
                  <this.TextFieldCheckGroup
                    type="text"
                    label="Telephone"
                    name="telephone"
                    checkLabel="Public"
                    checkName="telephone_public"
                  />
                  <this.TextFieldCheckGroup
                    type="text"
                    label="Mobile"
                    name="mobile"
                    checkLabel="Public"
                    checkName="mobile_public"
                  />
                  <this.TextFieldCheckGroup
                    type="number"
                    label="Age"
                    name="age"
                    checkLabel="Public"
                    checkName="age_public"
                  />
                  <this.SelectFieldCheckGroup
                    label="Gender"
                    placeholder="Select Gender"
                    name="sex"
                    dataSource={staticData.sexes}
                    checkLabel="Public"
                    checkName="sex_public"
                  />
                  <this.SelectFieldCheckGroup
                    label="Nationality"
                    placeholder="Select Nationality"
                    name="nationality"
                    dataSource={staticData.nationalities}
                    checkLabel="Public"
                    checkName="nationality_public"
                    searchable
                    searchPlaceholder="Search"
                  />
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>CV</Col>
                    <Col sm={10}>
                      <this.TextField
                        componentClass="textarea"
                        name="description"
                      />
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
                    </Col>
                  </FormGroup>
                  <FormGroup>
                    <Col componentClass={ControlLabel} sm={2}>Video Pitch</Col>
                    <Col sm={10}>
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
                    </Col>
                  </FormGroup>
                  <this.CheckBoxGroup
                    checkLabel="References Available"
                    name="has_references"
                  />
                  <this.CheckBoxGroup
                    checkLabel="All of the information provided is truthful to the best of my knowledge."
                    name="truth_confirmation"
                  />
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
                  <this.SubmitButtonGroup
                    submtting={loading || uploading}
                    labels={['Save', 'Saving...']}
                    onClick={this.onSave}
                  />
                </Form>
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
        }
      </div>
    );
  }
}
