import React from 'react';
import { connect } from 'react-redux';
import { Modal, Icon, Button } from 'antd';
import { removeUser } from 'redux/recruiter/users';

const DeleteDialog = ({ user, removeUser, onCancel }) => {
  const { id, email, business } = user || {};
  const onRemoveUser = () => {
    removeUser({
      id,
      business,
      successMsg: {
        message: `User(${email}) is removed.`
      },
      failMsg: {
        message: `Removing user(${email}) is failed.`
      }
    });
    onCancel();
  };

  let comment = 'Are you sure?';

  return (
    <Modal
      className="ant-confirm ant-confirm-confirm"
      closable={false}
      maskClosable={true}
      title={null}
      visible={!!user}
      footer={null}
      onCancel={onCancel}
    >
      <div className="ant-confirm-body-wrapper">
        <div className="ant-confirm-body">
          <Icon type="question-circle" />
          <div className="ant-confirm-content">{comment}</div>
        </div>
        <div className="ant-confirm-btns">
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="danger" onClick={onRemoveUser}>
            Remove
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default connect(null, {
  removeUser
})(DeleteDialog);
