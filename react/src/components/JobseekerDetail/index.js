import React from 'react';
import { ModalHeader, ModalBody, ModalFooter, Button } from 'reactstrap';

import * as helper from 'utils/helper';
import { Board, Logo, Loading, Checkbox } from 'components';
import Wrapper from './Wrapper';

export default class JobseekerDetail extends React.Component {
  onPlayPitch = () => window.open(this.props.jobseeker.pitches[this.props.jobseeker.pitches.length - 1].video);

  onViewCV = () => window.open(this.props.jobseeker.cv);

  onChangeShortlist = event => this.props.onChangeShortlist(event.target.checked);

  onClose = onClick => {
    onClick();
    this.props.onClose();
  };

  render() {
    console.log(this.props);

    const { application, jobseeker, buttons, onClose } = this.props;
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
      <Wrapper isOpen toggle={onClose} size="lg">
        <ModalHeader toggle={onClose}>Jobseeker Detail</ModalHeader>

        <ModalBody>
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
                      <i className="fa fa-play-circle-o" />Video Pitch
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
                <i className="fa fa-check-square-o" aria-hidden="true" />
                National Insurance number supplied
              </div>
            )}
            {jobseeker.has_references && (
              <div className="check-label">
                <i className="fa fa-check-square-o" aria-hidden="true" />
                Reference available on request
              </div>
            )}
            {jobseeker.truth_confirmation && (
              <div className="check-label">
                <i className="fa fa-check-square-o" aria-hidden="true" />
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
        </ModalBody>

        <ModalFooter>
          <div>
            {buttons &&
              buttons.map((button, index) => (
                <Button
                  key={index}
                  color={button.color}
                  outline={button.outline}
                  onClick={() => this.onClose(button.onClick)}
                >
                  {button.label}
                </Button>
              ))}
          </div>

          <Button color="gray" outline onClick={onClose}>
            Close
          </Button>
        </ModalFooter>
      </Wrapper>
    );
  }
}
