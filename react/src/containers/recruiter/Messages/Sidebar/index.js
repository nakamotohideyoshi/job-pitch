import React, { Fragment } from 'react';
import { withRouter } from 'react-router-dom';
import { Select, List } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';

import { AlertMsg, Logo, SelectEx, SearchBox, ListEx } from 'components';
import StyledSider from './styled';

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
          .getFullJSName(job_seeker)
          .toLowerCase()
          .indexOf(filterText.toLowerCase()) >= 0)
    );
  };

  renderApp = ({ id, messages, status, job_seeker }) => {
    const name = helper.getFullJSName(job_seeker);
    const image = helper.getPitch(job_seeker).thumbnail;
    const lastMessage = messages[messages.length - 1];
    const date = new Date(lastMessage.created);
    const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() - 2000}`;
    const userRole = helper.getNameByID('roles', lastMessage.from_role);
    const comment = `${userRole === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
    const deleted = status === DATA.APP.DELETED ? 'deleted' : '';
    const selected = id === this.props.selectedId ? 'selected' : '';

    return (
      <List.Item key={id} className={`${deleted} ${selected}`} onClick={() => this.selectApp(id)}>
        <List.Item.Meta
          avatar={<Logo src={image} size="48px" />}
          title={
            <Fragment>
              <span className="title single-line">{name}</span>
              <span className="date">{strDate}</span>
            </Fragment>
          }
          description={
            <Fragment>
              <div className="single-line">{comment}</div>
            </Fragment>
          }
        />
      </List.Item>
    );
  };

  render() {
    const { jobs, applications } = this.props;

    return (
      <StyledSider width={300}>
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
                  <Logo src={helper.getJobLogo(job)} size="22px" />
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
      </StyledSider>
    );
  }
}

export default withRouter(Sidebar);
