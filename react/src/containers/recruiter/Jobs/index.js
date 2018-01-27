import React from 'react';
import Helmet from 'react-helmet';
import { Switch, Route } from 'react-router-dom';
import { Container } from 'reactstrap';
import { PageHeader } from 'components';

import BusinessList from './BusinessList';
import BusinessEdit from './BusinessEdit';
import WorkplaceList from './WorkplaceList';
import WorkplaceEdit from './WorkplaceEdit';
import JobList from './JobList';
import JobEdit from './JobEdit';
import JobInterface from './JobInterface';
import Wrapper from './Wrapper';

class Jobs extends React.Component {
  render() {
    const { match } = this.props;

    return (
      <Wrapper>
        <Helmet title="My Workplace & Jobs" />

        <Container>
          <PageHeader>My Workplace & Jobs</PageHeader>

          <Switch>
            <Route exact path={`${match.path}/`} component={BusinessList} />
            <Route exact path={`${match.path}/add`} component={BusinessEdit} />
            <Route exact path={`${match.path}/:businessId/edit`} component={BusinessEdit} />
            <Route exact path={`${match.path}/:businessId`} component={WorkplaceList} />
            <Route exact path={`${match.path}/:businessId/add`} component={WorkplaceEdit} />
            <Route exact path={`${match.path}/:businessId/:workplaceId/edit`} component={WorkplaceEdit} />
            <Route exact path={`${match.path}/:businessId/:workplaceId`} component={JobList} />
            <Route exact path={`${match.path}/:businessId/:workplaceId/add`} component={JobEdit} />
            <Route exact path={`${match.path}/:businessId/:workplaceId/:jobId/edit`} component={JobEdit} />
            <Route exact path={`${match.path}/:businessId/:workplaceId/:jobId`} component={JobInterface} />
          </Switch>
        </Container>
      </Wrapper>
    );
  }
}

export default Jobs;
