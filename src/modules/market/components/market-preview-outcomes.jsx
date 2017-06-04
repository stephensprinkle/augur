import React from 'react';

import MarketPreviewOutcome from 'modules/market/components/market-preview-outcome';

const MarketOutcomes = p => (
  <div className="market-preview-outcomes">
    {(p.outcomes || []).map((outcome, i) => (
      <MarketPreviewOutcome outcome={outcome} />
    ))}
  </div>
);

MarketOutcomes.propTypes = {
  outcomes: React.PropTypes.array
};

export default MarketOutcomes;
