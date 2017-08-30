import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactSuperSelect from 'react-super-select';

export default class DropBox extends Component {
  static propTypes = {
    headerLabel: PropTypes.string,
    onRefresh: PropTypes.func,
    onAdd: PropTypes.func,
    onEdit: PropTypes.func,
    onDelete: PropTypes.func,
    placeholder: PropTypes.string,
    dataSource: PropTypes.array,
    initialValue: PropTypes.object,
    onChange: PropTypes.func,
    customOptionTemplateFunction: PropTypes.func,
    customFilterFunction: PropTypes.func,
    disabled: PropTypes.bool,
    readOnly: PropTypes.bool,
  }

  static defaultProps = {
    headerLabel: '',
    onRefresh: null,
    onAdd: null,
    onEdit: null,
    onDelete: null,
    placeholder: '',
    dataSource: [],
    initialValue: null,
    onChange: () => {},
    customOptionTemplateFunction: null,
    customFilterFunction: null,
    disabled: false,
    readOnly: false,
  }

  render() {
    const { headerLabel, onRefresh, onAdd, onEdit, onDelete, onChange, disabled, readOnly,
      placeholder, dataSource, initialValue, customOptionTemplateFunction, customFilterFunction
    } = this.props;
    return (
      <div className="lg-select">
        <div className="header">
          <div className="title">
            {headerLabel}
          </div>
          <button
            disabled={disabled || !onRefresh}
            className="fa fa-refresh btn-icon"
            onClick={onRefresh}
          />
          {
            !readOnly &&
            <div style={{ display: 'inline-flex' }}>
              <button
                disabled={disabled || !onAdd}
                className="fa fa-plus btn-icon"
                onClick={onAdd}
              />
              <button
                disabled={disabled || !onEdit}
                className="fa fa-pencil btn-icon"
                onClick={onEdit}
              />
              <button
                disabled={disabled || !onDelete}
                className="fa fa-trash-o btn-icon"
                onClick={onDelete}
              />
            </div>
          }
        </div>

        <ReactSuperSelect
          placeholder={placeholder}
          dataSource={dataSource}
          initialValue={initialValue || undefined}
          onChange={onChange}
          customOptionTemplateFunction={customOptionTemplateFunction}
          customFilterFunction={customFilterFunction}
          searchable={dataSource.length > 0}
          searchPlaceholder="Search"
          deselectOnSelectedOptionClick={false}
          noResultsString=""
        />
      </div>
    );
  }
}
