import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';

import Link from 'modules/link/components/link';
import ValueDenomination from 'modules/common/components/value-denomination';
import OutcomeTrade from 'modules/outcomes/components/outcome-trade';

import { BID, ASK } from 'modules/transactions/constants/types';
import { PRICE, SHARE } from 'modules/order-book/constants/order-book-value-types';
import { OUTCOME_VALUE_INCREASED, OUTCOME_VALUE_DECREASED } from 'modules/outcomes/constants/outcome-value-change';
import { SCALAR } from 'modules/markets/constants/market-types';

import getValue from 'utils/get-value';
import setShareDenomination from 'utils/set-share-denomination';

export default class Outcome extends Component {
  static propTypes = {
    price: PropTypes.number
  }

  constructor(props) {
    super(props);

    this.state = {
      topBidPriceChange: null,
      topAskPriceChange: null
    };

  }

  componentDidMount() {
  }

  componentWillUpdate(nextProps, nextState) {
    const p = this.props;
    const currentTopBidPrice = getValue(p, 'outcome.topBid.price');
    const nextTopBidPrice = getValue(nextProps, 'outcome.topBid.price');
    const currentTopAskPrice = getValue(p, 'outcome.topAsk.price');
    const nextTopAskPrice = getValue(nextProps, 'outcome.topAsk.price');
    if (currentTopBidPrice !== nextTopBidPrice) {
      const topBidPriceChange = nextTopBidPrice > currentTopBidPrice ? OUTCOME_VALUE_INCREASED : OUTCOME_VALUE_DECREASED;
      this.setState({
        topBidPriceChange
      });
    }
    if (currentTopAskPrice !== nextTopAskPrice) {
      const topAskPriceChange = nextTopAskPrice > currentTopAskPrice ? OUTCOME_VALUE_INCREASED : OUTCOME_VALUE_DECREASED;
      this.setState({
        topAskPriceChange
      });
    }
  }

  render() {
    const p = this.props;
    const s = this.state;

    const selectedOutcomeID = getValue(p, 'selectedOutcome.id');

    const outcomeName = getValue(p, 'outcome.name');

    const topBidShares = setShareDenomination(getValue(p, 'outcome.topBid.shares.formatted'), p.selectedShareDenomination);
    const topAskShares = setShareDenomination(getValue(p, 'outcome.topAsk.shares.formatted'), p.selectedShareDenomination);

    const topBidPrice = getValue(p, 'outcome.topBid.price.formatted');
    const topAskPrice = getValue(p, 'outcome.topAsk.price.formatted');

    const lastPrice = getValue(p, 'outcome.lastPrice.formatted');
    const lastPricePercent = getValue(p, 'outcome.lastPricePercent.rounded');

    return (
      <article className={classNames('outcome', { selected: selectedOutcomeID === p.outcome.id })}>
        <Link
          className={classNames('outcome-row-full', { selected: selectedOutcomeID === p.outcome.id })}
          onClick={() => { p.updateSelectedOutcome(p.outcome); }}
        >
          {p.marketType === SCALAR ?
            <ValueDenomination formatted={lastPricePercent} /> :
            <span className="outcome">{outcomeName}</span>
          }
          <button
            className="unstyled"
            onClick={() => {
              p.updateTradeFromSelectedOrder(p.outcome.id, 0, BID, SHARE);
            }}
          >
            <ValueDenomination formatted={topBidShares} />
          </button>
          <button
            className={classNames('unstyled', {
              'flash-green': s.topBidPriceChange === OUTCOME_VALUE_INCREASED,
              'flash-red': s.topBidPriceChange === OUTCOME_VALUE_DECREASED
            })}
            onClick={() => {
              p.updateTradeFromSelectedOrder(p.outcome.id, 0, BID, PRICE);
            }}
          >
            <ValueDenomination className="emphasized" formatted={topBidPrice} />
          </button>
          <button
            className={classNames('unstyled', {
              'flash-green': s.topAskPriceChange === OUTCOME_VALUE_INCREASED,
              'flash-red': s.topAskPriceChange === OUTCOME_VALUE_DECREASED
            })}
            onClick={() => {
              p.updateTradeFromSelectedOrder(p.outcome.id, 0, ASK, PRICE);
            }}
          >
            <ValueDenomination className="emphasized" formatted={topAskPrice} />
          </button>
          <button
            className="unstyled"
            onClick={() => {
              p.updateTradeFromSelectedOrder(p.outcome.id, 0, ASK, SHARE);
            }}
          >
            <ValueDenomination formatted={topAskShares} />
          </button>
          <ValueDenomination formatted={lastPrice} />
        </Link>
        <Link
          className={classNames('outcome-row-condensed', { selected: selectedOutcomeID === p.outcome.id })}
          onClick={() => { p.updateSelectedOutcome(p.outcome); }}
        >
          {p.marketType === SCALAR ?
            <ValueDenomination formatted={lastPricePercent} /> :
            <span className="outcome-summary">
              <span className="outcome-name">{outcomeName}</span>
              <span>Last Price: <ValueDenomination formatted={lastPrice} /></span>
            </span>
          }
          <span className="outcome-best-orders outcome-best-bid">
              <button
                className="unstyled"
                onClick={() => {
              p.updateTradeFromSelectedOrder(p.outcome.id, 0, BID, SHARE);
            }}
          >
            <span className="outcome-best-container">
              <ValueDenomination className="emphasized" formatted={topBidPrice} />
              <ValueDenomination formatted={topBidShares} />
            </span>
          </button>
          </span>
          <span className="outcome-best-orders outcome-best-ask">
            <button
              className="unstyled"
              onClick={() => {
                p.updateTradeFromSelectedOrder(p.outcome.id, 0, ASK, SHARE);
            }}
          >
            <span className="outcome-best-container">
              <ValueDenomination className="emphasized" formatted={topAskPrice} />
              <ValueDenomination formatted={topAskShares} />
            </span>
          </button>
          </span>
        </Link>
        <OutcomeTrade
          marketType={p.marketType}
          selectedOutcome={p.selectedOutcome}
          tradeSummary={p.tradeSummary}
          submitTrade={p.submitTrade}
          selectedTradeSide={p.selectedTradeSide}
          selectedShareDenomination={p.selectedShareDenomination}
          updateSelectedTradeSide={p.updateSelectedTradeSide}
          outcomeTradeNavItems={p.outcomeTradeNavItems}
          minLimitPrice={p.minLimitPrice}
          maxLimitPrice={p.maxLimitPrice}
          isTradeCommitLocked={p.isTradeCommitLocked}
        />
      </article>
    );
  }
}
