import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { Loading } from 'components';
import ApiClient from 'helpers/ApiClient';
import * as utils from 'helpers/utils';
import ApplicationList from './ApplicationList';
import Thread from './Thread';
import styles from './Messages.scss';

export default class Messages extends Component {
  static propTypes = {
    params: PropTypes.object.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = { };
    this.api = ApiClient.shared();
  }

  componentDidMount() {
    this.api.getApplications('')
      .then(applications => {
        applications.sort((a, b) => {
          const date1 = new Date(a.messages[a.messages.length - 1].created);
          const date2 = new Date(b.messages[b.messages.length - 1].created);
          return date1.getTime() < date2.getTime();
        });
        this.setState({ applications });

        const appid = parseInt(utils.getShared('messages_selected_id'), 10);
        if (appid !== 0 && !appid) {
          this.onSelectedApplication(applications[0]);
        } else {
          const application = applications.filter(item => item.id === appid)[0];
          this.onSelectedApplication(application);
        }
      });
  }

  onSelectedApplication = selectedApp => {
    utils.setShared('messages_selected_id', (selectedApp || {}).id);
    this.setState({ selectedApp });
  }

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
    const { applications, selectedApp } = this.state;

    return (
      <div className={styles.root}>
        <Helmet title="My Messages" />

        {
          applications ?
            <div className="board-shadow">
              <ApplicationList
                parent={this}
                applications={applications}
                selectedApp={selectedApp}
              />
              <Thread
                parent={this}
                application={selectedApp}
              />
            </div> :
            <Loading />
        }
      </div>
    );
  }
}
