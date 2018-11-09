import React from 'react';
import { withRouter } from 'react-router-dom';
import moment from 'moment';
import { List, Tooltip, Drawer, Button, Badge } from 'antd';

import DATA from 'utils/data';
import * as helper from 'utils/helper';
import colors from 'utils/colors';
import { AlertMsg, Loading, ListEx, Icons, Logo, JobseekerDetails } from 'components';

/* eslint-disable react/prop-types */
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
      .getFullName(job_seeker)
      .toLowerCase()
      .indexOf(this.props.searchText) >= 0;

  renderApplication = app => {
    const { id, job_seeker, loading } = app;
    const avatar = helper.getAvatar(job_seeker);
    const name = helper.getFullName(job_seeker);

    const interview = app.interview || app.interviews.slice(-1)[0];

    let INTERVIEW_STATUS = {
      PENDING: 'Interview request sent',
      ACCEPTED: 'Interview accepted',
      COMPLETED: 'This interview is done',
      CANCELLED: `Interview cancelled by ${
        helper.getNameByID(DATA.roles, interview.cancelled_by) === 'RECRUITER' ? 'Recruiter' : 'Jobseeker'
      }`
    };

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
            <div className={`single-line ${interview.status}`} style={{ fontSize: '12px' }}>
              {`${INTERVIEW_STATUS[interview.status]} (${moment(interview.at).format('ddd DD MMM, YYYY [at] H:mm')})`}
            </div>
          }
        />
        {loading && <Loading className="mask" />}
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
    const selectedApp = helper.getItemById(applications, this.state.selectedId);
    return (
      <div className="interview">
        {job && (
          <ListEx
            data={applications}
            renderItem={this.renderApplication}
            filterOption={this.filterOption}
            emptyRender={this.renderEmpty}
          />
        )}
        <Drawer placement="right" onClose={() => this.onSelect()} visible={!!selectedApp}>
          {selectedApp && (
            <JobseekerDetails
              application={selectedApp}
              defaultTab="interview"
              actions={
                <div>
                  <Button type="primary" disabled={selectedApp.loading} onClick={() => this.onMessage(selectedApp)}>
                    Message
                    {selectedApp.newMsgs > 0 && (
                      <Badge
                        count={selectedApp.newMsgs > 9 ? '9+' : selectedApp.newMsgs}
                        style={{ backgroundColor: colors.yellow, marginLeft: '8px' }}
                      />
                    )}
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
