import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Form, Button } from 'antd';

import { updateAuth } from 'redux/auth';
import * as helper from 'utils/helper';

import Wrapper from './styled';

const { Item } = Form;

const SelectType = ({ user, updateAuth }) => {
  const setRecruiter = () => {
    helper.saveData('tutorial', 1);
    updateAuth({ status: 'recruiter' });
  };

  const setJobseeker = () => updateAuth({ status: 'jobseeker' });

  if (user.businesses.length > 0) {
    setRecruiter();
  } else if (user.job_seeker) {
    setJobseeker();
  } else if (helper.loadData('apply')) {
    setJobseeker();
  }

  return (
    <Wrapper className="container">
      <Helmet title="Select Type" />

      <Form className="shadow">
        <h1>Select Type</h1>

        <Item>
          <Button type="primary" onClick={setRecruiter}>
            I'm a Recruiter
          </Button>
        </Item>

        <Item>
          <Button type="secondary" onClick={setJobseeker}>
            I'm a JobSeeker
          </Button>
        </Item>
      </Form>
    </Wrapper>
  );
};

export default connect(
  state => ({
    user: state.auth.user
  }),
  { updateAuth }
)(SelectType);
