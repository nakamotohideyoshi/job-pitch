import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Select, List, Badge } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import { AlertMsg, SelectEx, SearchBox, ListEx, Logo } from 'components';
import Wrapper from './styled';

const Option = Select.Option;

class Sidebar extends React.PureComponent {
  state = {
    filterJobId: undefined,
    filterText: ''
  };

  setFilterJobId = filterJobId => this.setState({ filterJobId });
  setFilterText = filterText => this.setState({ filterText });

  selectApp = appId => {
    const { location, history } = this.props;
    const arr = location.pathname.split('/');
    arr[3] = appId;
    history.replace(arr.join('/'));
  };

  filterOption = ({ job, job_seeker }) => {
    const { filterJobId, filterText } = this.state;
    return (
      (!filterJobId || filterJobId === job) &&
      (!filterText ||
        helper
          .getFullName(job_seeker)
          .toLowerCase()
          .indexOf(filterText.toLowerCase()) >= 0)
    );
  };

  renderApp = ({ id, messages, status, job_seeker, newMsgs }) => {
    const name = helper.getFullName(job_seeker);
    const avatar = helper.getAvatar(job_seeker);
    const lastMessage = messages.filter(({ created }) => created).pop();
    let date, comment;
    if (lastMessage) {
      date = new Date(lastMessage.created);
      date = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() - 2000}`;
      const userRole = helper.getNameByID(DATA.roles, lastMessage.from_role);
      comment = `${userRole === 'RECRUITER' ? 'You: ' : ''}${lastMessage.content}`;
    }
    const deleted = status === DATA.APP.DELETED ? 'deleted' : '';
    const selected = id === this.props.selectedId ? 'selected' : '';

    return (
      <List.Item key={id} className={`${deleted} ${selected}`} onClick={() => this.selectApp(id)}>
        <List.Item.Meta
          avatar={<Logo src={avatar} size="48px" />}
          title={
            <Fragment>
              <span className="title single-line">{name}</span>
              {date && <span className="date">{date}</span>}
            </Fragment>
          }
          description={
            <Fragment>
              {comment && <div className="single-line">{comment}</div>}
              {!!newMsgs && <Badge count={newMsgs < 10 ? newMsgs : '9+'} />}
            </Fragment>
          }
        />
      </List.Item>
    );
  };

  render() {
    const { jobs, applications } = this.props;

    return (
      <Wrapper className="sidebar">
        <div className="filters">
          <SelectEx
            allowClear
            value={this.state.filterJobId}
            placeholder="Filter by job"
            onChange={this.setFilterJobId}
          >
            {jobs.map(job => {
              return (
                <Option key={job.id} value={job.id}>
                  <Logo src={helper.getJobLogo(job)} className="logo" size="22px" />
                  {job.title}
                </Option>
              );
            })}
          </SelectEx>

          <SearchBox onChange={this.setFilterText} />
        </div>

        <div className="applications">
          <ListEx
            data={applications}
            pagination={{ simple: true, pageSize: 20 }}
            renderItem={this.renderApp}
            emptyRender={
              <AlertMsg>
                <span>You have no applications.</span>
              </AlertMsg>
            }
            filterOption={this.filterOption}
          />
        </div>
      </Wrapper>
    );
  }
}

Sidebar.propTypes = {
  jobs: PropTypes.array,
  applications: PropTypes.array,
  selectedId: PropTypes.number,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired
};

Sidebar.defaultProps = {
  jobs: null,
  applications: null,
  selectedId: null
};

export default withRouter(Sidebar);
