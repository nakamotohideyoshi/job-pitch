import React, { Fragment } from 'react';
import { Divider, List, Button } from 'antd';

import { Icons, Logo } from 'components';
import Wrapper from './Wrapper';

import * as helper from 'utils/helper';
import DATA from 'utils/data';

const JobseekerDetail = ({ application, jobseeker, className }) => {
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

  const playPitch = () => window.open(jobseeker.pitches[this.props.jobseeker.pitches.length - 1].video);

  const viewCV = () => window.open(jobseeker.cv);

  return (
    <Wrapper className={className}>
      <List.Item>
        <List.Item.Meta
          avatar={<Logo src={image} size="100px" />}
          title={<span className="title">{fullName}</span>}
          description={
            <div>
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
              {jobseeker.pitches.length > 0 && (
                <div>
                  <a onClick={playPitch}>
                    <Icons.Play />Video Pitch
                  </a>
                </div>
              )}
            </div>
          }
        />
      </List.Item>

      <Divider />

      <h4>Overview</h4>

      <div className="overview">{jobseeker.description}</div>

      {jobseeker.cv && <Button onClick={viewCV}>CV View</Button>}

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
        </Fragment>
      )}
    </Wrapper>
  );
};

export default JobseekerDetail;
