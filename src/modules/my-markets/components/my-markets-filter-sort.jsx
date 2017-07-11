import React from 'react';
import PropTypes from 'prop-types';

import Input from 'modules/common/components/input';

const MyMarketsFilterSort = p => {
  return (
    <article className="my-positions-filter">
      <div className="view-header-group">
        {/*<Dropdown*/}
          {/*default="open"*/}
          {/*options={["open", "reporting", "closed"]} // TODO where to store these?*/}
          {/*onChange={(type) => { p.onChange(type, null, null); }}*/}
        {/*/>*/}
        {/*<div className="companion-fields">*/}
          {/*<Dropdown*/}
            {/*className="companion-field"*/}
            {/*default={p.selectedFilterSort.sort}*/}
            {/*options={p.sorts}*/}
            {/*onChange={(sort) => { p.onChange(null, sort, null); }}*/}
          {/*/>*/}
          {/*<button*/}
            {/*className="unstyled"*/}
            {/*onClick={() => { p.onChange(null, null, !p.selectedFilterSort.isDesc); }}*/}
          {/*>*/}
            {/*{p.selectedFilterSort.isDesc ? <i className="fa fa-sort-amount-desc" /> : <i className="fa fa-sort-amount-asc" />}*/}
          {/*</button>*/}
        {/*</div>*/}
      </div>
      <Input
        isSearch
        isClearable
        placeholder='Search Your Created Markets'
        onChange={p.updateKeywords}
      />
    </article>
  );
};

MyMarketsFilterSort.propTypes = {
  updateKeywords: PropTypes.func
};

export default MyMarketsFilterSort;
