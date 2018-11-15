import React from 'react';
import Helmet from 'react-helmet';
import { Form, Button } from 'antd';

import DATA from 'utils/data';
import Wrapper from './styled';

const { Item } = Form;

/* eslint-disable react/prop-types */
const SelectType = ({ history }) => {
  const setRecruiter = () => {
    DATA.tutorial = 1;
    DATA.userRole = DATA.ROLE.RECRUITER;
    history.push('/recruiter');
  };

  const setJobseeker = () => {
    DATA.tutorial = 1;
    DATA.userRole = DATA.ROLE.JOBSEEKER;
    history.push('/jobseeker');
  };

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

export default SelectType;
