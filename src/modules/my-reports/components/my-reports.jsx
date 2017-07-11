import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip';

import MyReport from 'modules/my-reports/components/my-report';
import MyReportsFilterSort from 'modules/my-reports/components/my-reports-filter-sort';

import NullStateMessage from 'modules/common/components/null-state-message';
import Link from 'modules/link/components/link';
import TransactionsLoadingActions from 'modules/transactions/components/transactions-loading-actions';

export default class MyReports extends Component {
  static propTypes = {
    branch: PropTypes.object.isRequired,
    reports: PropTypes.array.isRequired
  };

  constructor(props) {
    super(props);

    this.defaultNullStateMessage = 'No Reports Made';
    this.state = {
      keywords: '',
      branch: props.branch || {},
      filteredReports: props.reports || [],
      nullStateMessage: this.defaultNullStateMessage
    };

    this.filterMyReports = this.filterMyReports.bind(this);
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.reports !== nextProps.reports) {
      this.setState({ filteredReports: nextProps.reports});
    }
    if (this.state.keywords !== nextState.keywords) {
      this.filterMyReports(nextProps.reports, nextState);
    }
  }

  updateKeywordsState(keywords) {
    this.setState({ keywords });
  }

  filterMyReports(reports, s) {
    let filteredReports = reports;

    if (s.keywords) {
      filteredReports = (reports || []).filter(report=> report.TODO.toLowerCase().indexOf(s.keywords.toLowerCase()) >= 0);
    }

    if (!filteredReports.length) {
      this.setState({
        nullStateMessage: "No Reports Match Your Search"
      });
    } else {
      this.setState({
        nullStateMessage: this.defaultNullMessage
      });
    }

    if (filteredReports !== s.filteredReports) {
      this.setState({
        filteredReports
      });
    }
  }

  render() {
    const p = this.props;
    const s = this.state;

    return (
      <article className="my-reports">
        <div className="view-header">
          <div className="view-header-group">
            <MyReportsFilterSort
              onChange={this.updateKeywordsState}
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
        {s.filteredReports && s.filteredReports.length ?
          <div>
            {s.filteredReports.map(market => (
              <div
                key={market.marketID}
                className="portfolio-market"
              >
                <div
                  className="portfolio-market-overview"
                >
                  <Link
                    {...market.marketLink}
                  >
                <span className="description">
                  {market.description}
                </span>
                  </Link>
                  {market.isChallenged &&
                  <i
                    className="fa fa-gavel outcome-challenged"
                    data-tip="This outcome is currently being challenged"
                  />
                  }
                  {!market.isChallenged && market.isChallengeable &&
                  <i
                    className="fa fa-exclamation-circle outcome-challengeable"
                    data-tip="This outcome is eligible to be challenged"
                  />
                  }
                </div>
                <MyReport
                  {...market}
                  branch={p.branch}
                />
              </div>
            ))}
          </div> :
          <NullStateMessage message={this.state.nullMessage} />
        }
        <ReactTooltip type="light" effect="solid" place="top" />
      </article>
    );
  }
}
