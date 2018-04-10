import React, { Fragment } from 'react';
import { Divider, List, Avatar, Button } from 'antd';

import { Icons, VideoPlayer } from 'components';
import Wrapper from './Wrapper';

import * as helper from 'utils/helper';
import DATA from 'utils/data';

class JobseekerDetail extends React.Component {
  state = {
    show: false
  };

  playPitch = show => this.setState({ show });

  viewCV = () => window.open(this.props.jobseeker.cv);

  render() {
    const { application, jobseeker, className } = this.props;
    const image = helper.getPitch(jobseeker).thumbnail;
    const fullName = helper.getFullJSName(jobseeker);
    const age = jobseeker.age_public && jobseeker.age;
    const sex = jobseeker.sex_public && helper.getNameByID('sexes', jobseeker.sex);
    const connected = (application || {}).status === DATA.APP.ESTABLISHED;

    let email, mobile;
    if (connected) {
      email = jobseeker.email_public && jobseeker.email;
      mobile = jobseeker.mobile_public && jobseeker.mobile;
    }

    const pitch = helper.getPitch(jobseeker);

    return (
      <Wrapper className={className}>
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={image} />}
            title={fullName}
            description={
              <Fragment>
                <div>
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
                {pitch && (
                  <div>
                    <a onClick={() => this.playPitch(true)}>
                      <Icons.Play />Video Pitch
                    </a>
                  </div>
                )}
              </Fragment>
            }
          />
        </List.Item>

        <Divider />

        <h3>Overview</h3>

        <div className="overview">{jobseeker.description}</div>

        {jobseeker.cv && <Button onClick={this.viewCV}>CV View</Button>}

        {jobseeker.has_national_insurance_number && (
          <div className="check-label">
            <Icons.Check />
            National Insurance number supplied
          </div>
        )}
        {jobseeker.has_references && (
          <div className="check-label">
            <Icons.Check />
            Reference available on request
          </div>
        )}
        {jobseeker.truth_confirmation && (
          <div className="check-label">
            <Icons.Check />
            I confirm that all information provided is truthful and confirm I have the right to work in the UK
          </div>
        )}

        {connected && (
          <Fragment>
            <Divider />

            <h3>Contact</h3>

            {email && (
              <p>
                <label>Email:</label> {email}
              </p>
            )}

            {mobile && (
              <p>
                <label>Mobile:</label> {mobile}
              </p>
            )}

            {!email && !mobile && <p>No contact details supplied</p>}
          </Fragment>
        )}

        {this.state.show && <VideoPlayer videoUrl={pitch.video} onClose={() => this.playPitch()} />}
      </Wrapper>
    );
  }
}

export default JobseekerDetail;
