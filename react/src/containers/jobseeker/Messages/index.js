import React, { Fragment } from 'react';
import Helmet from 'react-helmet';
import { connect } from 'react-redux';
import FontAwesomeIcon from '@fortawesome/react-fontawesome';
import faSearch from '@fortawesome/fontawesome-free-solid/faSearch';
import faBars from '@fortawesome/fontawesome-free-solid/faBars';
import { Board, Loading, SearchBox, Logo, MessageThread, FlexBox, JobDetail } from 'components';

import * as helper from 'utils/helper';
// import { loadProfile } from 'redux/jobseeker/profile';
// import { getMsgApplications, selectApplication, sendMessage } from 'redux/applications';
// import Container from './Wrapper';

// import NoPitch from '../NoPitch';

import { updateStatus, getApplications } from 'redux/jobseeker/myapps';

class JSMessages extends React.Component {
  componentWillMount() {
    this.props.getApplications();
  }

  // state = {
  //   open: true
  // };

  // componentWillMount() {
  //   this.props.loadProfile();
  //   this.appId = helper.str2int(this.props.match.params.appId);
  //   this.props.getMsgApplications(this.appId);
  // }

  // componentWillReceiveProps(nextProps) {
  //   const appId = helper.str2int(nextProps.match.params.appId);
  //   if (appId && appId !== this.appId) {
  //     this.appId = appId;
  //     this.props.selectApplication(appId);
  //     helper.saveData('messages_app', appId);
  //   }
  // }

  // onSend = message => this.props.sendMessage(message);

  // onSelectApplication = appId => {
  //   this.setState({ open: false });
  //   this.props.history.push(`/jobseeker/messages/${appId}/`);
  // };

  // onChangeFilterText = searchText => this.setState({ searchText });

  // onToggleSidebar = () => this.setState({ open: !this.state.open });

  // onShowJobDetail = showJobDetail => this.setState({ showJobDetail });

  // renderApplications = () => {
  //   const { applications, errors } = this.props;

  //   if (applications.length === 0) {
  //     return (
  //       <FlexBox center>
  //         <div className="alert-msg">{!errors ? 'You have no applications.' : 'Server Error!'}</div>
  //       </FlexBox>
  //     );
  //   }

  //   const { searchText } = this.state;
  //   const filteredApps = applications.filter(
  //     app => !searchText || app.job_data.title.toLowerCase().indexOf(searchText) !== -1
  //   );

  //   if (filteredApps.length === 0) {
  //     return (
  //       <FlexBox center>
  //         <div className="alert-msg">
  //           <FontAwesomeIcon icon={faSearch} />
  //           No search results
  //         </div>
  //       </FlexBox>
  //     );
  //   }

  //   return (
  //     <div className="app-list">
  //       {filteredApps.map(app => {
  //         const { id, job_data, messages, status } = app;
  //         const name = job_data.title;
  //         const image = helper.getJobLogo(job_data);
  //         const subTitle = helper.getFullBWName(job_data);
  //         const lastMessage = messages[messages.length - 1];
  //         const userRole = helper.getNameByID('roles', lastMessage.from_role);
  //         const comment = `${userRole === 'JOB_SEEKER' ? 'You: ' : ''}${lastMessage.content}`;
  //         const date = new Date(lastMessage.created);
  //         const strDate = `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear() - 2000}`;
  //         const deleted = helper.getNameByID('appStatuses', status) === 'DELETED' ? 'deleted' : '';
  //         const selected = id === (this.props.selectedApp || {}).id ? 'selected' : '';

  //         return (
  //           <a
  //             key={id}
  //             className={[selected, deleted, 'application'].join(' ')}
  //             onClick={() => this.onSelectApplication(id)}
  //           >
  //             <Logo src={image} size="50" className="logo" circle />
  //             <div className="content">
  //               <div>
  //                 <div className="name single-line">{name}</div>
  //                 <span className="date">{strDate}</span>
  //               </div>
  //               <div className="sub-title single-line">{subTitle}</div>
  //               <span className="single-line">{comment}</span>
  //             </div>
  //           </a>
  //         );
  //       })}
  //     </div>
  //   );
  // };

  // renderThreadHeader = () => {
  //   const { selectedApp } = this.props;
  //   const job = selectedApp.job_data;
  //   const headerTitle = job.title;
  //   const headerComment = helper.getFullBWName(job);

  //   return (
  //     <div>
  //       <div>
  //         <a className="title" onClick={() => this.onShowJobDetail(true)}>
  //           {headerTitle}
  //         </a>
  //       </div>
  //       <div>
  //         <a onClick={() => this.onShowJobDetail(true)}>{headerComment}</a>
  //       </div>
  //     </div>
  //   );
  // };

  render() {
    const { applications, jobseeker } = this.props;
    // const open = this.state.open ? 'open' : '';

    // if (jobseeker) {
    //   if (!helper.getPitch(jobseeker)) {
    //     return <NoPitch />;
    //   }
    // }

    return (
      <Fragment>
        <Helmet title="My Messages" />

        <Board>
          <div className="mask" onClick={() => this.setState({ open: false })} />

          <div className="sidebar">
            <SearchBox onChange={this.onChangeFilterText} />
            {/* {this.renderApplications()} */}
          </div>

          <div className="thread-container">
            <div className="thread-header">
              <a className="toggle" onClick={this.onToggleSidebar}>
                <FontAwesomeIcon icon={faBars} size="lg" />
              </a>
              {/* {selectedApp && this.renderThreadHeader()} */}
            </div>

            {/* {selectedApp && <MessageThread userRole="JOB_SEEKER" application={selectedApp} onSend={this.onSend} />} */}
          </div>

          {/* {this.state.showJobDetail && <JobDetail job={selectedApp.job_data} onClose={() => this.onShowJobDetail()} />} */}
        </Board>

        {/* <div>
          {applications ? (
            // <Board block className={`board ${open}`}>
            //   <div className="mask" onClick={() => this.setState({ open: false })} />

            //   <div className="sidebar">
            //     <SearchBar onChange={this.onChangeFilterText} />
            //     {this.renderApplications()}
            //   </div>

            //   <div className="thread-container">
            //     <div className="thread-header">
            //       <a className="toggle" onClick={this.onToggleSidebar}>
            //         <FontAwesomeIcon icon={faBars} size="lg" />
            //       </a>
            //       {selectedApp && this.renderThreadHeader()}
            //     </div>

            //     {selectedApp && <MessageThread userRole="JOB_SEEKER" application={selectedApp} onSend={this.onSend} />}
            //   </div>

            //   {this.state.showJobDetail && (
            //     <JobDetail job={selectedApp.job_data} onClose={() => this.onShowJobDetail()} />
            //   )}
            // </Board>
          ) : (
            <Loading size="large" />
          )}
        </div> */}
      </Fragment>
    );
  }
}

export default connect(
  state => ({
    jobseeker: state.auth.jobseeker,
    applications: state.js_myapps.applications,
    error: state.js_myapps.error
    // selectedApp: state.applications.selectedApp
  }),
  {
    // loadProfile,
    getApplications
    // selectApplication,
    // sendMessage
  }
)(JSMessages);
