import React from 'react';
import { List } from 'antd';

import { AlertMsg, Loading } from 'components';

class ListEx extends React.Component {
  state = {
    currentPage: 1
  };

  render() {
    const { currentPage } = this.state;
    const { data, error, loading, loadingSize, emptyRender, filterOption, renderItem, pagination } = this.props;

    if (error) {
      return (
        <AlertMsg error>
          <span>{error}</span>
        </AlertMsg>
      );
    }

    if (!data) {
      return <Loading size={loadingSize} />;
    }

    if (!data.length) {
      return typeof emptyRender === 'function' ? emptyRender() : emptyRender;
    }

    const filteredData = filterOption ? data.filter(filterOption) : data;
    if (filteredData.length === 0) {
      return (
        <AlertMsg>
          <span>No search results</span>
        </AlertMsg>
      );
    }

    let pageData = filteredData;
    let pageConfig;
    if (pagination) {
      const pageSize = pagination.pageSize || 10;
      const total = filteredData.length;
      let index = Math.min(currentPage, Math.floor((total + pageSize - 1) / pageSize));
      pageData = filteredData.slice((index - 1) * pageSize, index * pageSize);
      pageConfig = {
        ...pagination,
        pageSize,
        total,
        current: index,
        onChange: currentPage => this.setState({ currentPage })
      };
    }

    return (
      <List
        itemLayout="horizontal"
        dataSource={pageData}
        pagination={pageConfig}
        loading={loading}
        renderItem={renderItem}
      />
    );
  }
}

export default ListEx;
