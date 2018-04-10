import React from 'react';
import { connect } from 'react-redux';

import * as helper from 'utils/helper';

import { JobDetail } from 'components';
import StyledModal from './styled';

class JSJobDetails extends React.Component {
  // applyJob = () => {
  //   const { jobseeker, applyJob, history } = this.props;
  //   const pitch = helper.getPitch(jobseeker);
  //   if (pitch) {
  //     confirm({
  //       title: 'Yes, I want to apply to this job',
  //       okText: 'Apply',
  //       cancelText: 'Cancel',
  //       maskClosable: true,
  //       onOk: () => {
  //         applyJob({
  //           data: { job: this.state.job.id, job_seeker: jobseeker.id },
  //           success: () => {
  //             this.goFind();
  //           },
  //           fail: () => message.error('Apply failed!')
  //         });
  //       }
  //     });
  //   } else {
  //     confirm({
  //       title: 'You need to record your pitch video to apply.',
  //       okText: 'Record my pitch',
  //       cancelText: 'Cancel',
  //       maskClosable: true,
  //       onOk: () => {
  //         history.push('/jobseeker/settings/record');
  //       }
  //     });
  //   }
  // };

  // removeJob = () => {
  //   const { removeJob, loadingItem } = this.props;
  //   const { job } = this.state;

  //   if (loadingItem === job.id) return;

  //   confirm({
  //     title: 'Are you sure you are not interested in this job?',
  //     okText: `I'm Sure`,
  //     okType: 'danger',
  //     cancelText: 'Cancel',
  //     maskClosable: true,
  //     onOk: () => {
  //       removeJob(job.id);
  //       this.goFind();
  //     }
  //   });
  // };

  render() {
    const { job, onClose } = this.props;

    return (
      <StyledModal visible footer={null} className="container" title="Job Details" onCancel={onClose}>
        <div className="content">
          <JobDetail className="job-detail" job={job} />

          {/* <div className="buttons">
            <Button type="primary" loading={ === job.id} onClick={this.applyJob}>
              Apply
            </Button>

            <Button onClick={this.removeJob}>Remove</Button>
          </div> */}
        </div>
      </StyledModal>
    );
  }
}

export default JSJobDetails;
