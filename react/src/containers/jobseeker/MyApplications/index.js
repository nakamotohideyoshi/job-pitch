import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List, Tooltip, Button, Drawer } from 'antd';

import { getApplications } from 'redux/selectors';
import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { PageHeader, SearchBox, AlertMsg, ListEx, Icons, JobDetails, Logo } from 'components';
import NoPitch from '../components/NoPitch';
import Wrapper from './styled';

class MyApplications extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    const { location } = this.props;
    const { appId } = location.state || {};
    if (appId) {
      this.setState({ selectedId: appId });
    }
  }

  onChangeSearchText = searchText => this.setState({ searchText });

  onSelect = selectedId => this.setState({ selectedId });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/jobseeker/messages/${id}/`);
  };

  filterOption = ({ job_data }) => {
    const searchText = this.state.searchText.toLowerCase();
    const name = helper.getFullBWName(job_data);
    return job_data.title.toLowerCase().indexOf(searchText) >= 0 || name.toLowerCase().indexOf(searchText) >= 0;
  };

  renderApplication = app => {
    const { id, job_data } = app;
    const { title, contract, hours } = job_data;
    const logo = helper.getJobLogo(job_data);
    const name = helper.getFullBWName(job_data);
    const contractName = helper.getItemByID(DATA.contracts, contract).short_name;
    const hoursName = helper.getItemByID(DATA.hours, hours).short_name;
    const sector = helper.getNameByID('sectors', job_data.sector);

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Message">
            <span onClick={e => this.onMessage(app, e)}>
              <Icons.CommentAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onSelect(id)}
      >
        <List.Item.Meta avatar={<Logo src={logo} size="80px" padding="10px" />} title={title} description={name} />
        <span style={{ width: '180px' }}>
          <div>{sector}</div>
          <div>
            {contractName} / {hoursName}
          </div>
        </span>
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>You have no applications.</span>
    </AlertMsg>
  );

  render() {
    const { jobseeker, applications } = this.props;

    if (!helper.getPitch(jobseeker)) {
      return <NoPitch title="My Applications" />;
    }

    const selectedApp = applications && helper.getItemByID(applications, this.state.selectedId);

    return (
      <Wrapper className="container">
        <Helmet title="My Applications" />

        <PageHeader>
          <h2>My Applications</h2>
          <SearchBox width="200px" onChange={this.onChangeSearchText} />
        </PageHeader>

        <div className="content">
          <ListEx
            data={applications}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            filterOption={this.filterOption}
            renderItem={this.renderApplication}
            emptyRender={this.renderEmpty}
          />
        </div>

        <Drawer placement="right" closable={false} onClose={() => this.onSelect()} visible={!!selectedApp}>
          {selectedApp && (
            <JobDetails
              application={selectedApp}
              actions={
                <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onMessage(selectedApp)}>
                  Message
                </Button>
              }
            />
          )}
        </Drawer>
      </Wrapper>
    );
  }
}

export default connect(state => ({
  jobseeker: state.js_profile.jobseeker,
  applications: getApplications(state)
}))(MyApplications);
