import React, { Component } from 'react';
import classNames from 'classnames';
import ReactTooltip from 'react-tooltip';

import ValueDenomination from 'modules/common/components/value-denomination';

import { OUTCOME_VALUE_INCREASED, OUTCOME_VALUE_DECREASED } from 'modules/outcomes/constants/outcome-value-change';

import getValue from 'utils/get-value';

export default class MarketPreviewOutcome extends Component {
  constructor(props) {
    super(props);

    this.state = {
      lastPricePercentChange: null,
    };
  }

  componentWillUpdate(nextProps, nextState) {
    const p = this.props;
    const lastPricePercent = getValue(p, 'outcome.lastPricePercent');
    const nextPricePercent = getValue(nextProps, 'outcome.lastPricePercent');
    if (lastPricePercent !== nextPricePercent) {
      const lastPricePercentChange = lastPricePercent > nextPricePercent ? OUTCOME_VALUE_INCREASED : OUTCOME_VALUE_DECREASED;
      this.setState({
        lastPricePercentChange
      });
    }
  }

  render() {

    const p = this.props;
    const s = this.state;
    return (
      <div
        key={p.outcome.id}
        className="outcome"
      >
        {!!p.outcome.lastPricePercent &&
        <ValueDenomination
          className={classNames('outcome-price', {
            'flash-green': s.lastPricePercentChange === OUTCOME_VALUE_INCREASED,
            'flash-red': s.lastPricePercentChange === OUTCOME_VALUE_DECREASED
          })}
          {...p.outcome.lastPricePercent}
          formatted={p.outcome.lastPricePercent.rounded}
          formattedValue={p.outcome.lastPricePercent.roundedValue}
        />
        }
        <span
          data-tip
          data-for={`outcome-name-tooltip-${p.outcome.marketID}-${p.outcome.id}`}
          data-event="click focus"
          className="outcome-name"
        >
          {p.outcome.name}
        </span>
        <ReactTooltip
          id={`outcome-name-tooltip-${p.outcome.marketID}-${p.outcome.id}`}
          type="dark"
          effect="float"
          place="top"
          globalEventOff="click"
        >
          <span
            data-tip
            data-for={`outcome-name-tooltip-${p.outcome.marketID}-${p.outcome.id}`}
            data-event="click focus"
            className="tooltip-text"
          >
            {p.outcome.name}
          </span>
        </ReactTooltip>
      </div>
    );
  }
}
