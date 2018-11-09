import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { List } from 'antd';

import * as helper from 'utils/helper';
import { getPublicWorkplaceAction } from 'redux/jobseeker/find';
import { PageHeader, Loading, ListEx, Logo, AlertMsg } from 'components';
import Wrapper from './styled';

/* eslint-disable react/prop-types */
class PublicWorkplace extends React.Component {
  state = {
    selectedId: null,
    searchText: ''
  };

  componentWillMount() {
    const { match, workplace, getPublicWorkplaceAction } = this.props;
    const workplaceId = helper.str2int(match.params.workplaceId);
    if (workplaceId && !workplace) {
      getPublicWorkplaceAction(workplaceId);
    }
  }

  onSelect = id => {
    this.props.history.push(`/public/jobs/${id}`);
  };

  renderJob = job => {
    const { id, title, description } = job;
    const logo = helper.getJobLogo(job);
    return (
      <List.Item key={id} onClick={() => this.onSelect(id)}>
        <List.Item.Meta
          avatar={<Logo src={logo} size="80px" padding="10px" />}
          title={title}
          description={description}
        />
      </List.Item>
    );
  };

  renderEmpty = () => {
    return <AlertMsg>No Jobs</AlertMsg>;
  };

  render() {
    const { workplace, error } = this.props;

    if (error) {
      return (
        <AlertMsg>
          <span>Server Error!</span>
        </AlertMsg>
      );
    }

    if (!workplace) {
      return <Loading size="large" />;
    }

    const { name, business_data, jobs } = workplace;

    const title = `${business_data.name}, ${name}`;

    return (
      <Wrapper className="container">
        <Helmet title={title} />

        <PageHeader>
          <h2>{title}</h2>
        </PageHeader>

        <div className="content">
          <ListEx data={jobs} renderItem={this.renderJob} emptyRender={this.renderEmpty} />
        </div>
      </Wrapper>
    );
  }
}

export default connect(
  state => ({
    workplace: state.js_find.publicWorkplace,
    error: state.js_find.error
  }),
  {
    getPublicWorkplaceAction
  }
)(PublicWorkplace);
