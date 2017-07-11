import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MyMarket from 'modules/my-markets/components/my-market';
import MyMarketsFilterSort from 'modules/my-markets/components/my-markets-filter-sort';

import NullStateMessage from 'modules/common/components/null-state-message';
import Link from 'modules/link/components/link';
import TransactionsLoadingActions from 'modules/transactions/components/transactions-loading-actions';


export default class MyMarkets extends Component {
  static propTypes = {
    myMarkets: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.defaultNullMessage = "No Markets Created";
    this.state = {
      keywords: '',
      filteredMyMarkets: props.myMarkets || [],
      nullStateMessage: this.defaultNullMessage
    };

    this.filterMyMarkets = this.filterMyMarkets.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.myMarkets !== nextProps.myMarkets) {
      this.setState({myMarkets: nextProps.myMarkets});
    }
    if (this.state.keywords !== nextState.keywords) {
      this.filterMyMarkets(nextProps.myMarkets, nextState);
    }
  }

  updateKeywordsState(keywords) {
    this.setState({ keywords });
  }

  filterMyMarkets(myMarkets, s) {
    let filteredMyMarkets = myMarkets;

    // Filter Based on Keywords
    if (s.keywords) {
      filteredMyMarkets = (myMarkets || []).filter(market => market.TODO.toLowerCase().indexOf(s.keywords.toLowerCase()) >= 0);
    }

    if (!filteredMyMarkets.length) {
      this.setState({
        nullStateMessage: "No Created Markets Match Your Search"
      });
    } else {
      this.setState({
        nullStateMessage: this.defaultNullMessage
      });
    }

    if (filteredMyMarkets !== s.filteredMyMarkets) {
      this.setState({
        filteredMyMarkets
      });
    }
  }

  render() {
    const p = this.props;
    const s = this.state;

    return (
      <article className="my-markets">
        <div className="view-header">
          <div className="view-header-group">
            <MyMarketsFilterSort
              updateKeywords={this.updateKeywordsState}
            />
          </div>
          <div className="view-header-group">
            <TransactionsLoadingActions
              loadMoreTransactions={p.loadMoreTransactions}
              loadAllTransactions={p.loadAllTransactions}
              transactionsLoading={p.transactionsLoading}
              hasAllTransactionsLoaded={p.hasAllTransactionsLoaded}
            />
          </div>
        </div>
        {s.filteredMyMarkets && s.filteredMyMarkets.length ?
          <div>
            {s.filteredMyMarkets.map(market => (
              <div
                key={market.id}
                className="portfolio-market"
              >
                <div
                  className="my-market-overview portfolio-market-overview"
                >
                  <Link
                    {...market.marketLink}
                  >
                    <span>{market.description}</span>
                  </Link>
                </div>
                <MyMarket
                  {...market}
                />
              </div>
            ))}
          </div> :
          <NullStateMessage message={this.state.nullStateMessage} />
        }
      </article>
    );
  }
}
