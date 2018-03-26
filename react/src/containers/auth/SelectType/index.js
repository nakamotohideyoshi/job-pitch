import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Form, Button } from 'antd';

import { updateAuth } from 'redux/auth';

import Container from './Wrapper';

const { Item } = Form;

const SelectType = ({ user, updateAuth }) => {
  const setRecruiter = () => updateAuth({ status: 'recruiter' });
  const setJobseeker = () => updateAuth({ status: 'jobseeker' });

  if (user.businesses.length > 0) {
    setRecruiter();
  } else if (user.job_seeker) {
    setJobseeker();
  }

  return (
    <Container>
      <Helmet title="Select Type" />

      <Form className="shadow1">
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
    </Container>
  );
};

export default connect(
  state => ({
    user: state.auth.user
  }),
  { updateAuth }
)(SelectType);
