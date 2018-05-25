import React, { Fragment } from 'react';
import { Divider, List, Avatar, Button } from 'antd';

import * as helper from 'utils/helper';
import DATA from 'utils/data';

import { Icons, VideoPlayer } from 'components';
import Wrapper from './Details.styled';

export default class Details extends React.Component {
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

    const pitches = jobseeker.pitches.filter(({ video }) => video);

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
              </Fragment>
            }
          />
        </List.Item>

        <Divider />

        <div>
          <h3>Overview</h3>
          {pitches.map(({ id, thumbnail, video }) => (
            <div key={id} className="pitch-video">
              <VideoPlayer
                controls
                poster={thumbnail}
                preload="none"
                sources={[
                  {
                    src: video,
                    type: 'video/mp4'
                  }
                ]}
              />
            </div>
          ))}
          <p className="description">{jobseeker.description}</p>
        </div>

        {jobseeker.cv && <Button onClick={this.viewCV}>CV View</Button>}

        {jobseeker.has_national_insurance_number && (
          <div className="check-label">
            <Icons.CheckSquare size="lg" />
            National Insurance number supplied
          </div>
        )}
        {jobseeker.has_references && (
          <div className="check-label">
            <Icons.CheckSquare size="lg" />
            Reference available on request
          </div>
        )}
        {jobseeker.truth_confirmation && (
          <div className="check-label">
            <Icons.CheckSquare size="lg" />
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
      </Wrapper>
    );
  }
}
