import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Row, Col } from 'reactstrap';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import { PageHeader, SearchBar, Loading, MJPCard, FlexBox, JobDetail } from 'components';

import * as helper from 'utils/helper';
import { confirm } from 'redux/common';
import { loadProfile } from 'redux/jobseeker/profile';
import { getApplications } from 'redux/applications';
import Container from './Wrapper';

import NoPitch from '../NoPitch';

class MyApplications extends React.Component {
  state = {};

  componentWillMount() {
    this.props.loadProfile();
    this.props.getApplications();
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.applications === null && nextProps.applications) {
      helper.loadData('jobs_selectedid').then(id => {
        if (id) {
          helper.saveData('jobs_selectedid');
          const app = helper.getItemByID(nextProps.applications, id);
          this.onDetail(app);
        }
      });
    }
  }

  onDetail = selectedApp => this.setState({ selectedApp });

  onMessage = app => this.props.history.push(`/jobseeker/messages/${app.id}/`);

  filterApp = filterText => this.setState({ filterText });

  renderApplications = () => {
    const { applications } = this.props;

    if (applications.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">You have no applications.</div>
        </FlexBox>
      );
    }

    const { filterText } = this.state;
    const filteredApps = applications.filter(
      app =>
        !filterText ||
        app.job_data.title.toLowerCase().indexOf(filterText) !== -1 ||
        app.job_data.location_data.name.toLowerCase().indexOf(filterText) !== -1 ||
        app.job_data.location_data.business_data.name.toLowerCase().indexOf(filterText) !== -1
    );

    if (filteredApps.length === 0) {
      return (
        <FlexBox center>
          <div className="alert-msg">
            <FontAwesomeIcon icon={faSearch} />
            No search results
          </div>
        </FlexBox>
      );
    }

    return (
      <Row>
        {filteredApps.map(app => {
          const job = app.job_data;
          const logo = helper.getJobLogo(job);
          const businessName = helper.getFullBWName(job);
          const contract = helper.getNameByID('contracts', job.contract);
          const hours = helper.getNameByID('hours', job.hours);

          return (
            <Col xs="12" sm="6" md="4" lg="3" key={job.id}>
              <MJPCard
                image={logo}
                title={job.title}
                tProperty1={businessName}
                // description={job.description}
                bProperty1={contract}
                bProperty2={hours}
                onClick={() => this.onDetail(app)}
                menus={[
                  {
                    label: 'Message',
                    onClick: () => this.onMessage(app)
                  }
                ]}
              />
            </Col>
          );
        })}
      </Row>
    );
  };

  render() {
    const { applications, errors, jobseeker } = this.props;
    const { selectedApp } = this.state;

    if (jobseeker) {
      if (!helper.getPitch(jobseeker)) {
        return <NoPitch />;
      }
    }

    return (
      <Fragment>
        <Helmet title="My Applications" />

        <Container>
          {applications && (
            <PageHeader>
              <span>My Applications</span>
              <SearchBar size="sm" onChange={this.filterApp} />
            </PageHeader>
          )}
          {applications && this.renderApplications()}
          {!applications && (
            <FlexBox center>{!errors ? <Loading /> : <div className="alert-msg">Server Error!</div>}</FlexBox>
          )}
        </Container>

        {selectedApp && (
          <JobDetail
            job={selectedApp.job_data}
            onClose={() => this.onDetail()}
            buttons={[
              {
                label: 'Message',
                color: 'green',
                onClick: () => this.onMessage(selectedApp)
              }
            ]}
          />
        )}
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.js_profile.jobseeker,
    applications: state.applications.applications,
    errors: state.applications.errors
  }),
  {
    confirm,
    loadProfile,
    getApplications
  }
)(MyApplications);
