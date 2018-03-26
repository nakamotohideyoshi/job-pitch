import React, { Fragment } from 'react';
import { Divider, List } from 'antd';

import * as helper from 'utils/helper';
import { GoogleMap } from 'components';
import Wrapper from './Wrapper';

const JobDetail = ({ job, className }) => {
  const logo = helper.getJobLogo(job);
  const workplace = job.location_data;
  const bwName = helper.getFullBWName(job);
  const marker = { lat: workplace.latitude, lng: workplace.longitude };
  const contract = helper.getNameByID('contracts', job.contract);
  const hours = helper.getNameByID('hours', job.hours);

  return (
    <Wrapper className={className}>
      <List.Item>
        <List.Item.Meta
          avatar={<img src={logo} alt="" width="100" />}
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
          <GoogleMap marker={marker} />
        </div>
      </div>
    </Wrapper>
  );
};

export default JobDetail;
