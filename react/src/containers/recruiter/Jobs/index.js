import React from 'react';
import Helmet from 'react-helmet';
import { Switch, Route } from 'react-router-dom';

import { PageHeader } from 'components';
import BusinessList from './BusinessList';
import BusinessEdit from './BusinessEdit';
import WorkplaceList from './WorkplaceList';
import WorkplaceEdit from './WorkplaceEdit';
import JobList from './JobList';
import JobEdit from './JobEdit';
import JobInterface from './JobInterface';
import Wrapper from './styled';

const RCJobs = () => {
  return (
    <Wrapper className="container">
      <Helmet title="My Workplace & Jobs" />

      <PageHeader>
        <h2>My Workplace & Jobs</h2>
      </PageHeader>

      <Switch>
        <Route exact path="/recruiter/jobs/business" component={BusinessList} />
        <Route exact path="/recruiter/jobs/business/add" component={BusinessEdit} />
        <Route exact path="/recruiter/jobs/business/edit/:businessId" component={BusinessEdit} />
        <Route exact path="/recruiter/jobs/workplace/:businessId" component={WorkplaceList} />
        <Route exact path="/recruiter/jobs/workplace/add/:businessId" component={WorkplaceEdit} />
        <Route exact path="/recruiter/jobs/workplace/edit/:workplaceId" component={WorkplaceEdit} />
        <Route exact path="/recruiter/jobs/job/:workplaceId" component={JobList} />
        <Route exact path="/recruiter/jobs/job/add/:workplaceId" component={JobEdit} />
        <Route exact path="/recruiter/jobs/job/edit/:jobId" component={JobEdit} />
        <Route exact path="/recruiter/jobs/job/view/:jobId" component={JobInterface} />
      </Switch>
    </Wrapper>
  );
};

export default RCJobs;
