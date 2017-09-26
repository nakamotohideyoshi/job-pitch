import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Helmet from 'react-helmet';
// import { Message, JobSeekerDetail, JobDetail } from 'components';
import { ItemList } from 'components';
import * as commonActions from 'redux/modules/common';
import * as utils from 'helpers/utils';
import ApiClient from 'helpers/ApiClient';
import ApplicationList from './ApplicationList';
import Thread from './Thread';
import styles from './Messages.scss';

@connect(
  () => ({
  }),
  { ...commonActions }
)
export default class Messages extends Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  onSelectedApplication = application => this.setState({ application })

  // onSend = () => {
  //   this.props.getApplications(`${this.state.selectedApp.id}/`)
  //     .then(selectedApp => {
  //       this.setState({ selectedApp });
  //       this.onRefresh();
  //     });
  // }

  // onDetail = () => {
  //   this.setState({
  //     messageDialog: false,
  //   });
  // }

  // dismissDialog = () => this.setState({
  //   selectedApp: null,
  // });




  render() {
    const { application } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="My Messages" />
        <div className="shadow-board">
          <ApplicationList
            parent={this}
            selectedApplication={application}
          />
          <Thread
            parent={this}
            application={application}
          />
        </div>
      </div>
    );
  }
}
