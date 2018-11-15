import React from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { List, Tooltip, Modal } from 'antd';

import { getHrJobsSelector } from 'redux/selectors';
import { getJobsAction, removeJobAction } from 'redux/hr/jobs';
import { PageHeader, ListEx, Loading, Icons, AlertMsg } from 'components';
import Wrapper from './styled';

const { confirm } = Modal;

/* eslint-disable react/prop-types */
class JobList extends React.Component {
  componentDidMount() {
    if (!this.props.jobs) {
      this.props.getJobsAction();
    }
  }

  onEdit = id => {
    this.props.history.push(`/hr/jobs/${id}`);
  };

  onRemove = ({ id, title }, event) => {
    event && event.stopPropagation();

    confirm({
      title: `Are you sure you want to delete ${title}`,
      okText: `Remove`,
      okType: 'danger',
      cancelText: 'Cancel',
      maskClosable: true,
      onOk: () => {
        this.props.removeJobAction({
          id,
          successMsg: `${title} is removed`,
          failMsg: `There was an error removing ${title}`
        });
      }
    });
  };

  renderJob = job => {
    const { id, title, loading } = job;

    return (
      <List.Item
        key={id}
        actions={[
          <Tooltip placement="bottom" title="Remove">
            <span onClick={e => this.onRemove(job, e)}>
              <Icons.TrashAlt />
            </span>
          </Tooltip>
        ]}
        onClick={() => this.onEdit(id)}
        className={`${loading ? 'loading' : ''}`}
      >
        <List.Item.Meta title={title} description={job.wor} />

        {loading && <Loading className="mask" />}
      </List.Item>
    );
  };

  renderEmpty = () => {
    return (
      <AlertMsg>
        <span>You have no jobs.</span>
        <Link to="/hr/jobs/add">Create job</Link>
      </AlertMsg>
    );
  };

  render() {
    const { jobs } = this.props;

    return (
      <Wrapper className="container">
        <Helmet title="Jobs" />

        <PageHeader>
          <h2>Jobs</h2>
          <Link to="/hr/jobs/add">Add new job</Link>
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
    jobs: getHrJobsSelector(state)
  }),
  {
    getJobsAction,
    removeJobAction
  }
)(JobList);
