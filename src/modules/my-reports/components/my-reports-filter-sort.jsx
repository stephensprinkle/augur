import React from 'react';
import PropTypes from 'prop-types';

import Input from 'modules/common/components/input';

const MyReportsFilterSort = p => {
  return (
    <article>
      <div className="view-header-group">
        {/* TODO what are the possible states of reports?  Look once have Internet connection */}
        <Dropdown
          default="open"
          // options={}
          onChange={(type) => { p.onChange(type, null, null); }}
        />
        <div className="companion-fields">
          <Dropdown
            className="companion-field"
            default={p.selectedFilterSort.sort}
            options={p.sorts}
            onChange={(sort) => { p.onChange(null, sort, null); }}
          />
          <button
            className="unstyled"
            onClick={() => { p.onChange(null, null, !p.selectedFilterSort.isDesc); }}
          >
            {p.selectedFilterSort.isDesc ? <i className="fa fa-sort-amount-desc" /> : <i className="fa fa-sort-amount-asc" />}
          </button>
        </div>
      </div>
      <div>
        <Input
          isSearch
          isClearable
          placeholder='Search Your Reports'
          onChange={p.updateKeywords}
        />
      </div>
    </article>
  );
};

MyReportsFilterSort.propTypes = {
  updateKeywords: PropTypes.func
};

export default MyReportsFilterSort;
