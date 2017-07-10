import React from 'react';
import PropTypes from 'prop-types';

import Input from 'modules/common/components/input';

const MyPositionsFilter = p => {
  return (
    <article className="my-positions-filter">
      <Input
        placeholder='Search Your Positions'
        onChange={p.updateKeywords}
      />
    </article>
  );
};

MyPositionsFilter.propTypes = {
  updateKeywords: PropTypes.func
};

export default MyPositionsFilter;
