import React from 'react';
import { Button, Switch } from 'antd';

import { JobseekerDetail } from 'components';
import StyledModal from './styled';

export default ({ application, jobseeker, onConnect, onRemove, onShortlist, onMessage, onClose }) => {
  const { job_seeker, shortlisted, loading } = application || {};
  const jobseeker1 = jobseeker || job_seeker;
  const loading1 = loading || jobseeker1.loading;

  return (
    <StyledModal visible footer={null} className="container" title="Application Details" onCancel={onClose}>
      <div className="content">
        <JobseekerDetail className="details" application={application} jobseeker={jobseeker1} />

        <div className="buttons">
          {onShortlist && (
            <div>
              <span>Shortlisted</span>
              <Switch checked={shortlisted} loading={loading1} onChange={onShortlist} />
            </div>
          )}

          {onConnect && (
            <Button type="primary" loading={loading1} onClick={onConnect}>
              Connect
            </Button>
          )}

          {onMessage && (
            <Button type="primary" onClick={onMessage}>
              Message
            </Button>
          )}

          {onRemove && (
            <Button type="danger" disabled={loading1} onClick={onRemove}>
              Remove
            </Button>
          )}
        </div>
      </div>
    </StyledModal>
  );
};
