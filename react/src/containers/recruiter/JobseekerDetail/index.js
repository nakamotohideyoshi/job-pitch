import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Button, Container } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faCheckSquare from '@fortawesome/fontawesome-free-regular/faCheckSquare';
import faPlayCircle from '@fortawesome/fontawesome-free-regular/faPlayCircle';

import * as helper from 'utils/helper';
import { getJobseeker } from 'redux/recruiter/jobseeker';

import { Board, Logo, Loading, Checkbox, FlexBox } from 'components';
import Wrapper from './Wrapper';

class JobseekerDetail extends React.Component {
  componentWillMount() {
    this.jobId = helper.str2int(this.props.match.params.jobId);
    this.jobseekerId = helper.str2int(this.props.match.params.jobseekerId);
    if (this.jobId || this.jobseekerId) {
      this.props.getJobseeker(this.jobId, this.jobseekerId);
    }
  }

  onPlayPitch = () => window.open(this.props.jobseeker.pitches[this.props.jobseeker.pitches.length - 1].video);

  onViewCV = () => window.open(this.props.jobseeker.cv);

  // onChangeShortlist = event => this.props.onChangeShortlist(event.target.checked);

  renderJobseeker = () => {
    const { application, errors } = this.props;
    let jobseeker = this.props.jobseeker || application.job_seeker;
    const image = helper.getJobseekerImg(jobseeker);
    const fullName = helper.getFullJSName(jobseeker);
    const age = jobseeker.age_public && jobseeker.age;
    const sex = jobseeker.sex_public && helper.getNameByID('sexes', jobseeker.sex);
    const connected = (application || {}).status === helper.getIDByName('appStatuses', 'ESTABLISHED');

    let email, mobile;
    if (connected) {
      email = jobseeker.email_public && jobseeker.email;
      mobile = jobseeker.mobile_public && jobseeker.mobile;
    }

    return (
      <div>
        <Board block className="main-board">
          <div className="info">
            <Logo src={image} circle size="100" />

            <div className="content">
              <div className="name">
                <h4>{fullName}</h4>

                {connected &&
                  (application.shortlisting ? (
                    <div className="loading">
                      <Loading size="15" />
                    </div>
                  ) : (
                    <Checkbox
                      className="shortlisted"
                      checked={application.shortlisted}
                      onChange={this.onChangeShortlist}
                      label="Shortlisted"
                    />
                  ))}
              </div>

              <div className="attributes">
                {age && (
                  <span>
                    <label>age:</label> {age}
                  </span>
                )}
                {sex && (
                  <span>
                    <label>sex:</label> {sex}
                  </span>
                )}
              </div>

              {jobseeker.pitches.length > 0 && (
                <div>
                  <a onClick={this.onPlayPitch}>
                    <FontAwesomeIcon icon={faPlayCircle} />Video Pitch
                  </a>
                </div>
              )}
            </div>
          </div>

          <hr />

          <div className="overview">
            <h4>Overview</h4>
            <div>{jobseeker.description}</div>
            {jobseeker.cv && (
              <Button outline color="gray" size="sm" onClick={this.onViewCV}>
                CV View
              </Button>
            )}
          </div>

          {jobseeker.has_national_insurance_number && (
            <div className="check-label">
              <FontAwesomeIcon icon={faCheckSquare} />
              National Insurance number supplied
            </div>
          )}
          {jobseeker.has_references && (
            <div className="check-label">
              <FontAwesomeIcon icon={faCheckSquare} />
              Reference available on request
            </div>
          )}
          {jobseeker.truth_confirmation && (
            <div className="check-label">
              <FontAwesomeIcon icon={faCheckSquare} />
              I confirm that all information provided is truthful and confirm I have the right to work in the UK
            </div>
          )}
        </Board>

        {connected && (
          <Board block className="contact-board">
            <h4>Contact</h4>
            {email && (
              <div>
                <label>Email:</label> {email}
              </div>
            )}
            {mobile && (
              <div>
                <label>Mobile:</label> {mobile}
              </div>
            )}
            {!email && !mobile && <div>No contact details supplied</div>}
          </Board>
        )}
      </div>
    );
  };

  render() {
    const { application, jobseeker, errors } = this.props;

    return (
      <Wrapper>
        <Helmet title="Jobseeker Detail" />

        <Container>
          {jobseeker || application ? (
            this.renderJobseeker()
          ) : (
            <FlexBox center>{!errors ? <Loading /> : <div className="alert-msg">Server Error!</div>}</FlexBox>
          )}
        </Container>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.rc_jobseeker.jobseeker,
    application: state.rc_jobseeker.application,
    errors: state.rc_jobseeker.errors
  }),
  {
    getJobseeker
  }
)(JobseekerDetail);
