import React from 'react';
import { withRouter } from 'react-router-dom';
import { List, Tooltip, Drawer, Button } from 'antd';
import moment from 'moment';

import * as helper from 'utils/helper';

import { AlertMsg, Loading, ListEx, Icons, JobseekerDetails, Logo } from 'components';

class Interviews extends React.Component {
  state = {
    selectedId: null
  };

  onSelect = selectedId => this.setState({ selectedId });

  onMessage = ({ id }, event) => {
    event && event.stopPropagation();
    this.props.history.push(`/recruiter/messages/${id}`);
  };

  filterOption = ({ job_seeker }) =>
    helper
      .getFullJSName(job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  renderApplication = app => {
    const { id, job_seeker, interview, loading } = app;
    const avatar = helper.getAvatar(job_seeker);
    const name = helper.getFullJSName(job_seeker);

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
        className={loading ? 'loading' : ''}
      >
        <List.Item.Meta
          avatar={<Logo src={avatar} size="80px" />}
          title={name}
          description={
            interview && (
              <div className={`single-line ${interview.status}`}>
                Interview: {moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')}
              </div>
            )
          }
        />
        {loading && <Loading className="mask" size="small" />}
      </List.Item>
    );
  };

  renderEmpty = () => (
    <AlertMsg>
      <span>
        {`You have not requested any interviews yet. Once that happens,
        their interviews will appear here.`}
      </span>
    </AlertMsg>
  );

  render() {
    const { job, applications } = this.props;
    const selectedApp = helper.getItemByID(applications, this.state.selectedId);
    return (
      <div className="interview">
        {job && (
          <ListEx
            data={applications}
            loadingSize="large"
            pagination={{ pageSize: 10 }}
            renderItem={this.renderApplication}
            filterOption={this.filterOption}
            emptyRender={this.renderEmpty}
          />
        )}
        <Drawer placement="right" closable={false} onClose={() => this.onSelect()} visible={!!selectedApp}>
          {selectedApp && (
            <JobseekerDetails
              application={selectedApp}
              defaultTab="interview"
              actions={
                <div>
                  <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onMessage(selectedApp)}>
                    Message
                  </Button>
                </div>
              }
            />
          )}
        </Drawer>
      </div>
    );
  }
}

export default withRouter(Interviews);
