import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Row, Col, Divider } from 'antd';

import * as helper from 'utils/helper';
import { Logo } from 'components';
import Wrapper from './Details.styled';

const Details = ({ employee }) => {
  const { telephone, sex, nationality, birthday, national_insurance_number, job } = employee;
  const avatar = helper.getAvatar(employee);
  const fullName = helper.getFullName(employee);

  return (
    <Wrapper>
      <h2>Employee Details</h2>

      <Row gutter={32}>
        <Col xs={10} sm={8} md={6} lg={5}>
          <div className="logo">
            <Logo src={avatar} size="100%" />
          </div>
        </Col>
        <Col xs={14} sm={16} md={18} lg={19}>
          <div className="info">
            <div className="name">{fullName}</div>
            <ul>
              {sex && (
                <li>
                  <strong>Sex:</strong> {sex}
                </li>
              )}
              {telephone && (
                <li>
                  <strong>Telephone:</strong> {telephone}
                </li>
              )}
              {nationality && (
                <li>
                  <strong>Ntionality:</strong> {nationality}
                </li>
              )}
              {birthday && (
                <li>
                  <strong>Birthday:</strong> {moment(birthday).format('ddd DD MMM, YYYY [at] H:mm')}
                </li>
              )}
              {national_insurance_number && (
                <li>
                  <strong>National insurance number:</strong> {national_insurance_number}
                </li>
              )}
              {/* <li>
                <strong>Job:</strong> {`${job_data.title} ( ${helper.getJobSubName(job_data)} )`}
              </li> */}
            </ul>
          </div>
        </Col>
      </Row>

      <Divider />

      <h4>Job description</h4>
      <p className="description">{job.description}</p>

      <Divider />

      {/* <h4>Workplace description</h4>
      <p className="description">{workplace.description}</p>

      <div className="map">
        <div>
          <GoogleMap marker={marker} />
        </div>
      </div> */}
    </Wrapper>
  );
};

Details.propTypes = {
  employee: PropTypes.object.isRequired
};

export default Details;
