import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ComponentNav from 'modules/common/components/component-nav';
import ValueDenomination from 'modules/common/components/value-denomination';
import NullStateMessage from 'modules/common/components/null-state-message';

import MyPosition from 'modules/my-positions/components/my-position';
import MyPositionsFilter from 'modules/my-positions/components/my-positions-filter';
import MyPositionsMarket from 'modules/my-positions/components/my-positions-market';
import TransactionsLoadingActions from 'modules/transactions/components/transactions-loading-actions';


import { POSITIONS_POSITIONS, POSITIONS_ORDERS } from 'modules/my-positions/constants/internal-views';

import getValue from 'utils/get-value';

export default class MyPositions extends Component {
  static propTypes = {
    market: PropTypes.object.isRequired,
    isTradeCommitLocked: PropTypes.bool,
    closePositionStatus: PropTypes.object.isRequired,
    scalarShareDenomination: PropTypes.object.isRequired,
    orderCancellation: PropTypes.object.isRequired
  }

  constructor(props) {
    super(props);

    this.navItems = {
      [POSITIONS_POSITIONS]: {
        label: 'Positions'
      },
      [POSITIONS_ORDERS]: {
        label: 'Orders'
      }
    };

    this.state = {
      keywords: '',
      nullStateMessage: 'No Positions Held',
      filteredMarkets: props.markets || [],
      selectedNav: POSITIONS_POSITIONS,
    };

    this.filterMyPositions = this.filterMyPositions.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.markets !== nextProps.markets) {
      this.setState({ filteredTopics: nextProps.markets });
    }
    if (this.state.keywords !== nextState.keywords) {
      this.filterMyPositions(nextProps.markets, nextState);
    }
  }

  updateKeywordsState(keywords) {
    console.log(`Updating keywords state`);
    this.setState({ keywords });
  }

  filterMyPositions(markets, s) {
    let filteredMarkets = markets;

    // Filter Based on Keywords
    if (s.keywords) {
      filteredMarkets = (markets || []).filter(market => market.description.toLowerCase().indexOf(s.keywords.toLowerCase()) >= 0);
    }

    if (!filteredMarkets.length) {
      this.setState({
        nullStateMessage: "No Positions Match Your Search"
      });
    } else {
      this.setState({
        nullStateMessage: 'No Positions Held'
      });
    }

    if (filteredMarkets !== s.filteredMarkets) {
      this.setState({
        filteredMarkets
      });
    }
  }

  render() {
    const p = this.props;
    const s = this.state;

    return (
      <article className="my-positions">
        <div className="view-header">
          <MyPositionsFilter
            updateKeywords={this.updateKeywordsState.bind(this)}

          />
          <div className="view-header-group" />
          <div className="view-header-group">
            <TransactionsLoadingActions
              loadMoreTransactions={p.loadMoreTransactions}
              loadAllTransactions={p.loadAllTransactions}
              transactionsLoading={p.transactionsLoading}
              hasAllTransactionsLoaded={p.hasAllTransactionsLoaded}
            />
          </div>
        </div>
        {s.filteredMarkets.length > 0 ?
          s.filteredMarkets.map(market => (
            <MyPositionsMarket
              key={market.id}
              market={market}
              closePositionStatus={p.closePositionStatus}
              isTradeCommitLocked={p.isTradeCommitLocked}
              scalarShareDenomination={p.scalarShareDenomination}
              orderCancellation={p.orderCancellation}
            />
          )) :
          <NullStateMessage
            message={this.state.nullStateMessage}
          />
        }
      </article>
    );
  }
}

MyPositions.propTypes = {
  markets: PropTypes.array.isRequired,
  isTradeCommitLocked: PropTypes.bool,
  closePositionStatus: PropTypes.object.isRequired,
  scalarShareDenomination: PropTypes.object.isRequired,
  orderCancellation: PropTypes.object.isRequired
};
