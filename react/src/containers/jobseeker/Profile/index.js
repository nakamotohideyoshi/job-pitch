import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import Dropzone from 'react-dropzone';
import { Container, Form, FormGroup, Label, Button, Row, Col } from 'reactstrap';

import {
  FormComponent,
  SaveFormComponent,
  Board,
  HelpIcon,
  Required,
  Alert,
  Loading,
  PopupProgress,
  VideoRecorder,
  VideoPlayer
} from 'components';
import { loadProfile, saveProfile } from 'redux/jobseeker/profile';
import { SDATA } from 'utils/data';
import Wrapper, { WithPublic } from './Wrapper';

class Profile extends SaveFormComponent {
  componentWillMount() {
    this.props.loadProfile();
  }

  componentWillReceiveProps(nextProps) {
    const { jobseeker } = nextProps;
    if (jobseeker && jobseeker !== this.props.jobseeker) {
      const model = Object.assign(this.state.model, jobseeker);
      this.setState({
        model,
        cv: null,
        newPitchUrl: null,
        newPitchData: null
      });

      const pitch = jobseeker.pitches ? jobseeker.pitches[0] : null;
      this.pitchUrl = pitch ? pitch.video : null;
    }
  }

  setDropzoneRef = ref => {
    this.dropzoneRef = ref;
  };

  openFileBrowser = () => this.dropzoneRef.open();

  selectedCV = files => {
    this.setState({
      cv: files[0]
    });
    FormComponent.modified = true;
  };

  removeCV = () => this.setState({ cv: null });

  recordPitch = () => this.setState({ showRecorder: true });

  playPitch = () => this.setState({ playUrl: this.pitchUrl });

  playNewPitch = () => this.setState({ playUrl: this.state.newPitchUrl });

  viewCV = () => window.open(this.props.jobseeker.cv);

  cancelNewPitch = () =>
    this.setState({
      newPitchUrl: null,
      newPitchData: null
    });

  hideDialog = (url, data) => {
    this.setState({
      newPitchUrl: url || this.state.newPitchUrl,
      newPitchData: data || this.state.newPitchData,
      showRecorder: false,
      playUrl: null
    });
  };

  onSave = () => {
    if (!this.isValid(['first_name', 'last_name', 'description'])) return;

    const { model, cv, newPitchData } = this.state;
    if (!model.truth_confirmation) {
      this.setState({
        errors: {
          message: 'You must check the box confirming the truth of the information you have provided.'
        }
      });
      return;
    }

    const data = Object.assign({}, model);
    data.cv = cv;
    this.props.saveProfile(data, newPitchData, (label, value) => {
      const progress = label ? { label, value } : null;
      this.setState({ progress });
    });
  };

  render() {
    if (!this.props.jobseeker) {
      return (
        <Wrapper>
          <Loading />
        </Wrapper>
      );
    }

    const { jobseeker, saving } = this.props;
    const { cv, newPitchData, showRecorder, playUrl, progress } = this.state;
    const error = this.getError();

    return (
      <Wrapper>
        <Helmet title="Profile" />

        <Container>
          <h2>Profile</h2>

          <Board block>
            <Form>
              <FormGroup>
                <this.FormCheckbox name="active" label="Active" />
              </FormGroup>

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>
                      First Name
                      <Required />
                    </Label>
                    <this.FormInput name="first_name" />
                  </FormGroup>
                </Col>

                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>
                      Last Name
                      <Required />
                    </Label>
                    <this.FormInput name="last_name" />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <WithPublic>
                      <Label>Email</Label>
                      <this.FormCheckbox name="email_public" label="Public" />
                    </WithPublic>
                    <this.FormInput name="email" type="email" />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <WithPublic>
                      <Label>Telephone</Label>
                      <this.FormCheckbox name="telephone_public" label="Public" />
                    </WithPublic>
                    <this.FormInput name="telephone" />
                  </FormGroup>
                </Col>
                <Col xs="12" md="6">
                  <FormGroup>
                    <WithPublic>
                      <Label>Mobile</Label>
                      <this.FormCheckbox name="mobile_public" label="Public" />
                    </WithPublic>
                    <this.FormInput name="mobile" />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <WithPublic>
                      <Label>Age</Label>
                      <this.FormCheckbox name="age_public" label="Public" />
                    </WithPublic>
                    <this.FormInput name="age" type="number" />
                  </FormGroup>
                </Col>
                <Col xs="12" md="6">
                  <FormGroup>
                    <WithPublic>
                      <Label>Gender</Label>
                      <this.FormCheckbox name="sex_public" label="Public" />
                    </WithPublic>
                    <this.FormSelect name="sex" options={SDATA.sexes} clearable={false} searchable={false} />
                  </FormGroup>
                </Col>
              </Row>

              <Row>
                <Col xs="12" md="6">
                  <FormGroup>
                    <WithPublic>
                      <Label>Nationality</Label>
                      <this.FormCheckbox name="nationality_public" label="Public" />
                    </WithPublic>
                    <this.FormSelect name="nationality" options={SDATA.nationalities} />
                  </FormGroup>
                </Col>
                <Col xs="12" md="6">
                  <FormGroup>
                    <Label>
                      National insurance number
                      <HelpIcon
                        label={`Supplying your national insurance number makes it easier for employers to recruit you.
                          Your National Insurance number will not be shared with employers.`}
                      />
                    </Label>
                    <this.FormInput name="national_insurance_number" />
                  </FormGroup>
                </Col>
              </Row>

              <FormGroup>
                <Label>
                  CV summary<Required />
                  <HelpIcon
                    label={`CV summary is what the recruiter first see,
                      write if you have previous relevant experience where and for how long.`}
                  />
                </Label>
                <this.FormTextArea name="description" maxLength="10000" minRows={3} maxRows={20} />

                <div className="cv-buttons">
                  {jobseeker.cv && (
                    <Button outline color="gray" onClick={this.viewCV}>
                      View CV
                    </Button>
                  )}
                  <Button outline color="gray" onClick={this.openFileBrowser}>
                    Upload CV
                  </Button>
                  <HelpIcon
                    label={`Upload your CV using your favourite cloud service, or take a photo if you have it printed out.`}
                  />
                  <Dropzone ref={this.setDropzoneRef} className="dropzone" multiple={false} onDrop={this.selectedCV} />
                </div>

                {cv && (
                  <Alert type="info">
                    {'CV added: save to upload and click '}
                    <a onClick={this.removeCV}>here</a>
                    {' to cancel'}
                  </Alert>
                )}
              </FormGroup>

              <FormGroup>
                <Label>
                  Video Pitch
                  <HelpIcon label={`Tips on how to record your pitch will be placed here.`} />
                </Label>

                <div>
                  <Button outline color="gray" onClick={this.recordPitch}>
                    Record New
                  </Button>
                  {this.pitchUrl && (
                    <Button outline color="gray" onClick={this.playPitch}>
                      Play Current
                    </Button>
                  )}
                </div>

                {newPitchData && (
                  <Alert type="info">
                    <a onClick={this.playNewPitch}>New video</a>
                    {' save to upload and click '}
                    <a onClick={this.cancelNewPitch}>here</a>
                    {' to cancel'}
                  </Alert>
                )}
              </FormGroup>

              <FormGroup>
                <this.FormCheckbox name="has_references" label="References Available" />
                <this.FormCheckbox
                  name="truth_confirmation"
                  label={`By ticking this box I confirm that all information given is true, I understand that any falsification may lead to dismissal,
                      and that I am entitled to work in UK & Northern Ireland. If required I will give full details if I have been convicted of any criminal offence.`}
                />
              </FormGroup>

              {error && <Alert type="danger">{error}</Alert>}

              <Button color="green" size="lg" disabled={saving} onClick={this.onSave}>
                {!saving ? 'Save' : 'Saving...'}
              </Button>
            </Form>
          </Board>
        </Container>

        {showRecorder && <VideoRecorder onClose={this.hideDialog} />}

        {playUrl && <VideoPlayer videoUrl={playUrl} onClose={this.hideDialog} />}

        {progress && <PopupProgress label={progress.label} value={progress.value} />}
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    errors: state.js_profile.errors,
    saving: state.js_profile.saving
  }),
  { loadProfile, saveProfile }
)(Profile);
