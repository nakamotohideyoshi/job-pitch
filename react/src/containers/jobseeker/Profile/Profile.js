import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { browserHistory } from 'react-router';
import Dropzone from 'react-dropzone';
import Scroll from 'react-scroll';
import Form from 'react-bootstrap/lib/Form';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import Col from 'react-bootstrap/lib/Col';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import Button from 'react-bootstrap/lib/Button';
import ProgressBar from 'react-bootstrap/lib/ProgressBar';
import AWS from 'aws-sdk';
import { Loading, HelpIcon, FormComponent } from 'components';
import VideoPlayer from 'components/VideoPlayer/VideoPlayer';
import VideoRecorder from 'components/VideoRecorder/VideoRecorder';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import * as commonActions from 'redux/modules/common';
import styles from './Profile.scss';

@connect(
  () => ({}),
  { ...commonActions }
)
export default class Profile extends FormComponent {

  static propTypes = {
    setPermission: PropTypes.func.isRequired,
  }

  constructor(props) {
    const api = ApiClient.shared();
    const jobSeeker = api.jobSeeker ? api.jobSeeker :
    {
      active: true,
      email_public: true,
      telephone_public: true,
      mobile_public: true,
      age_public: true,
      sex_public: true,
      nationality_public: true,
      email: utils.getCookie('email')
    };
    const formModel = Object.assign({}, jobSeeker);
    formModel.sex = api.sexes.filter(item => item.id === jobSeeker.sex)[0];
    formModel.nationality = api.nationalities.filter(item => item.id === jobSeeker.nationality)[0];

    super(props, { jobSeeker, formModel, needToSave: true });
    this.api = ApiClient.shared();
  }

  componentWillUnmount() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  onViewCV = () => window.open(this.state.jobSeeker.cv);

  onOpenBrowser = () => this.dropzoneRef.open();

  onChangedCV = files => {
    this.cv = files[0];
    this.setState({
      cvComment: 'CV added: save to upload.'
    });
    FormComponent.needToSave = true;
  }

  onRemovedCV = () => {
    this.cv = null;
    this.setState({
      cvComment: ''
    });
  }

  onShowRecorder = () => this.setState({
    isRecorder: true
  });

  onShowPlayer = () => this.setState({
    isPlayer: true,
  });

  onHideDialog = (url, recoredData) => {
    if (recoredData) {
      this.recoredData = recoredData;
    }

    this.setState({
      isRecorder: false,
      isPlayer: false,
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

    const data = Object.assign(this.state.jobSeeker, formModel);
    data.sex = formModel.sex && formModel.sex.id;
    data.nationality = formModel.nationality && formModel.nationality.id;
    data.cv = this.cv;

    this.setState({ saving: true });

    this.api.saveJobSeeker(data).then(jobSeeker => {
      const cvComment = this.cv ? 'CV added.' : '';
      this.cv = null;
      this.setState({ jobSeeker, cvComment });
      this.props.setPermission(jobSeeker.profile ? 2 : 1);

      if (this.recoredData) {
        this.uploadFile();
      } else {
        FormComponent.needToSave = false;
        utils.successNotif('Success!');
        if (jobSeeker.profile) {
          this.setState({ saving: false });
        } else {
          browserHistory.push('/jobseeker/jobprofile');
        }
      }
    })
    .catch(errors => this.setState({
      saving: false,
      errors
    }));
  }

  uploadFile = () => {
    this.api.createPitch().then(pitch => {
      const folder = location.origin.replace('//', '');
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
        Key: `${folder}/${pitch.token}.${pitch.id}.${new Date().getTime()}`,
        Body: this.recoredData,
        ContentType: 'video/webm',
      }, (err, data) => {
        if (!err) {
          console.log(data);
          this.checkPitch(pitch.id);
        } else {
          this.setState({
            progress: null,
            saving: false,
          });
          utils.errorNotif('Upload Failed!');
        }
      }).on('httpUploadProgress', progress => {
        this.setState({
          progress: Math.floor((progress.loaded / progress.total) * 100),
        });
      });
    });
  }

  checkPitch = (pitchId) => {
    this.api.getPitch(pitchId).then(pitch => {
      if (!pitch.video) {
        this.timer = setTimeout(() => this.checkPitch(pitchId), 2000);
      } else {
        FormComponent.needToSave = false;
        utils.successNotif('Success!');
        this.timer = null;
        this.recoredData = null;
        this.setState({
          recoreded: false,
          progress: null,
          saving: false,
        });
        if (!this.state.jobSeeker.profile) {
          browserHistory.push('/jobseeker/jobprofile');
        }
      }
    }).catch(() => {
      this.timer = setTimeout(() => this.checkPitch(pitchId), 2000);
    });
  }

  render() {
    const { jobSeeker, cvComment, isRecorder, isPlayer, saving, progress } = this.state;
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

          <div className="board shadow padding-45">
            <Form>
              <FormGroup className={styles.active}>
                <ControlLabel>Active</ControlLabel>
                <this.CheckBoxField label="" name="active" />
              </FormGroup>

              <div className={styles.name}>
                <FormGroup>
                  <Scroll.Element name="first_name">
                    <ControlLabel>First Name</ControlLabel>
                  </Scroll.Element>
                  <this.TextField type="text" name="first_name" />
                </FormGroup>
                <FormGroup>
                  <Scroll.Element name="last_name">
                    <ControlLabel>Last Name</ControlLabel>
                  </Scroll.Element>
                  <this.TextField type="text" name="last_name" />
                </FormGroup>
              </div>

              <FormGroup>
                <div className={styles.withHelp}>
                  <ControlLabel>Email</ControlLabel>
                  <ControlLabel>Public</ControlLabel>
                </div>
                <div className={styles.withCheckbox}>
                  <this.TextField type="email" name="email" disabled />
                  <this.CheckBoxField name="email_public" />
                </div>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Telephone</ControlLabel>
                <div className={styles.withCheckbox}>
                  <this.TextField type="text" name="telephone" />
                  <this.CheckBoxField name="telephone_public" />
                </div>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Mobile</ControlLabel>
                <div className={styles.withCheckbox}>
                  <this.TextField type="text" name="mobile" />
                  <this.CheckBoxField name="mobile_public" />
                </div>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Age</ControlLabel>
                <div className={styles.withCheckbox}>
                  <this.TextField type="number" name="age" />
                  <this.CheckBoxField name="age_public" />
                </div>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Gender</ControlLabel>
                <div className={styles.withCheckbox}>
                  <this.SelectField
                    placeholder="Select Gender"
                    name="sex"
                    options={this.api.sexes}
                    searchable={false}
                  />
                  <this.CheckBoxField name="sex_public" />
                </div>
              </FormGroup>

              <FormGroup>
                <ControlLabel>Nationality</ControlLabel>
                <div className={styles.withCheckbox}>
                  <this.SelectField
                    placeholder="Select Nationality"
                    name="nationality"
                    options={this.api.nationalities}
                  />
                  <this.CheckBoxField name="nationality_public" />
                </div>
              </FormGroup>

              <FormGroup>
                <ControlLabel>National insurance number</ControlLabel>
                <this.TextField type="text" name="national_insurance_number" />
              </FormGroup>

              <FormGroup>
                <Scroll.Element name="description">
                  <div className={styles.withHelp}>
                    <ControlLabel>CV summary</ControlLabel>
                    <HelpIcon
                      label={`CV summary is what the recruiter first see,
                        write if you have previous relevant experience where and for how long.`}
                    />
                  </div>
                </Scroll.Element>
                <this.TextAreaField
                  name="description"
                  maxLength="1000"
                  minRows={3}
                  maxRows={20}
                />
                <div className={styles.cvButtons}>
                  {
                    jobSeeker.cv && <Button onClick={this.onViewCV}>View CV</Button>
                  }
                  <Button onClick={this.onOpenBrowser}>Upload CV</Button>
                  <Dropzone
                    ref={node => { this.dropzoneRef = node; }}
                    multiple={false}
                    onDrop={this.onChangedCV}
                    className="h"
                  >
                  </Dropzone>
                  <HelpIcon
                    label={`Upload your CV using your favourite cloud service,
                     or take a photo if you have it printed out.`}
                  />
                </div>

                <div className={styles.cvComment}>
                  {cvComment}
                  {
                    this.cv &&
                    <button
                      type="button"
                      className="fa fa-times link-btn"
                      onClick={this.onRemovedCV}
                    />
                  }
                </div>
              </FormGroup>

              <FormGroup>
                <div className={styles.withHelp}>
                  <ControlLabel>Video Pitch</ControlLabel>
                  <HelpIcon label="Tips on how to record your pitch will be placed here." />
                </div>
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
                {/* <div className={styles.pitchComment}>
                  {pitchComment}
                  {
                    this.cv &&
                    <button
                      type="button"
                      className="fa fa-times link-btn"
                      onClick={this.onRemovedCV}
                    />
                  }
                </div> */}
              </FormGroup>

              <FormGroup>
                <this.CheckBoxField
                  label="References Available"
                  name="has_references"
                />
                <br /><br />
                <this.CheckBoxField
                  label="I confirm that all information provided is truthful and confirm I have the right to work in the UK"
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
                submtting={saving}
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
            <VideoPlayer
              videoUrl={videoUrl}
              onClose={this.onHideDialog}
            />
          }
        </div>
      </div>
    );
  }
}
