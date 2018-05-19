import React, { Fragment } from 'react';
import { Divider, List, Avatar } from 'antd';

import * as helper from 'utils/helper';
import { GoogleMap, Icons, VideoPlayer, SocialShare } from 'components';
import Wrapper from './styled';

export default class JobDetails extends React.Component {
  state = {
    show: false
  };

  playPitch = show => this.setState({ show });

  render() {
    const { job, className, roughLocation } = this.props;
    const logo = helper.getJobLogo(job);
    const workplace = job.location_data;
    const bwName = helper.getFullBWName(job);
    const marker = { lat: workplace.latitude, lng: workplace.longitude };
    const contract = helper.getNameByID('contracts', job.contract);
    const hours = helper.getNameByID('hours', job.hours);

    let circle;
    if (roughLocation) {
      const alpha = 2 * Math.PI * Math.random();
      const rand = Math.random();
      marker.lat += 0.00434195349206 * Math.cos(alpha) * rand;
      marker.lng += 0.00528038212262 * Math.sin(alpha) * rand;
      circle = {
        center: marker,
        radius: 482.8,
        options: {
          fillColor: '#ff930080',
          strokeColor: '#00b6a4',
          strokeWeight: 2
        }
      };
    }

    const pitch = helper.getPitch(job);

    return (
      <Wrapper className={className}>
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar src={logo} />}
            title={
              <Fragment>
                <span className="title">{job.title}</span>
                <span className="distance">{job.distance}</span>
              </Fragment>
            }
            description={
              <div>
                <div>{bwName}</div>
                <div>
                  <span style={{ marginRight: '20px' }}>
                    <label>hours:</label> {hours}
                  </span>
                  <span>
                    <label>contract:</label> {contract}
                  </span>
                </div>
                {pitch && (
                  <div>
                    <a onClick={() => this.playPitch(true)}>
                      <Icons.PlayCircle />Video Pitch
                    </a>
                  </div>
                )}
                <div className="label">Share Job</div>
                <SocialShare url={`${window.location.origin}/jobseeker/jobs/${job.id}`} />
              </div>
            }
          />
        </List.Item>

        <Divider />

        <div className="overview">
          <h4>Job Description</h4>
          <div>{job.description}</div>
        </div>

        <Divider />

        <div className="overview">
          <h4>Workplace Description</h4>
          <div>{workplace.description}</div>
        </div>

        <Divider />

        <div className="map">
          <div>
            <GoogleMap marker={marker} circle={circle} />
          </div>
        </div>

        {this.state.show && <VideoPlayer videoUrl={pitch.video} onClose={() => this.playPitch()} />}
      </Wrapper>
    );
  }
}
