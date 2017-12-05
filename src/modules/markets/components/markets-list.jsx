import React, { Component } from 'react'
import PropTypes from 'prop-types'

import MarketPreview from 'modules/market/components/market-preview/market-preview'
import Paginator from 'modules/common/components/paginator/paginator'
import NullStateMessage from 'modules/common/components/null-state-message/null-state-message'

import getValue from 'utils/get-value'
import isEqual from 'lodash/isEqual'

import debounce from 'utils/debounce'

export default class MarketsList extends Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
    isLogged: PropTypes.bool.isRequired,
    markets: PropTypes.array.isRequired,
    filteredMarkets: PropTypes.array.isRequired,
    location: PropTypes.object.isRequired,
    scalarShareDenomination: PropTypes.object.isRequired,
    toggleFavorite: PropTypes.func.isRequired,
    loadMarketsInfo: PropTypes.func.isRequired,
    paginationPageParam: PropTypes.string,
    linkType: PropTypes.string,
    showPagination: PropTypes.bool,
    outstandingReturns: PropTypes.bool,
  }

  static defaultProps = {
    showPagination: true,
    outstandingReturns: false,
  }

  constructor(props) {
    super(props)

    this.state = {
      lowerBound: this.props.showPagination ? null : 1,
      boundedLength: this.props.showPagination ? null : this.props.filteredMarkets.length,
      marketIDsMissingInfo: [] // This is ONLY the currently displayed markets that are missing info
    }

    this.setSegment = this.setSegment.bind(this)
    this.setMarketIDsMissingInfo = this.setMarketIDsMissingInfo.bind(this)
    this.loadMarketsInfo = debounce(this.loadMarketsInfo.bind(this))
  }

  componentWillMount() {
    this.loadMarketsInfo(this.props.filteredMarkets)
  }

  componentWillUpdate(nextProps, nextState) {
    if (
      this.state.lowerBound !== nextState.lowerBound ||
      this.state.boundedLength !== nextState.boundedLength ||
      !isEqual(this.props.filteredMarkets, nextProps.filteredMarkets)
    ) {
      this.setMarketIDsMissingInfo(nextProps.markets, nextProps.filteredMarkets, nextState.lowerBound, nextState.boundedLength)
    }

    if (!isEqual(this.state.marketIDsMissingInfo, nextState.marketIDsMissingInfo)) this.loadMarketsInfo(nextState.marketIDsMissingInfo)
  }

  setSegment(lowerBound, upperBound, boundedLength) {
    this.setState({ lowerBound, boundedLength })
  }

  setMarketIDsMissingInfo(markets, filteredMarkets, lowerBound, boundedLength) {
    const marketIDsMissingInfo = []
    if (filteredMarkets.length && boundedLength) {
      [...Array(boundedLength)].forEach((unused, i) => {
        const item = filteredMarkets[(lowerBound - 1) + i]
        const market = markets.find(market => market.id === item)
        if (market && !market.hasLoadedMarketInfo) marketIDsMissingInfo.push(market.id)
      })
    }

    this.setState({ marketIDsMissingInfo })
  }

  // debounced call
  loadMarketsInfo() {
    this.props.loadMarketsInfo(this.state.marketIDsMissingInfo)
  }

  // NOTE -- You'll notice the odd method used for rendering the previews, this is done for optimization reasons
  render() {
    const p = this.props
    const s = this.state

    const marketsLength = p.markets.length
    const shareDenominations = getValue(p, 'scalarShareDenomination.denominations')

    return (
      <article className="markets-list">
        {marketsLength && s.boundedLength ?
          [...Array(s.boundedLength)].map((unused, i) => {
            const id = p.filteredMarkets[(s.lowerBound - 1) + i]
            const market = p.markets.find(market => market.id === id)
            const selectedShareDenomination = market ? getValue(p, `scalarShareDenomination.markets.${market.id}`) : null

            if (market && market.id) {
              return (
                <MarketPreview
                  {...market}
                  key={`${market.id} - ${market.outcomes}`}
                  isLogged={p.isLogged}
                  selectedShareDenomination={selectedShareDenomination}
                  shareDenominations={shareDenominations}
                  toggleFavorite={p.toggleFavorite}
                  linkType={p.linkType}
                  location={p.location}
                  history={p.history}
                  outstandingReturns={p.outstandingReturns}
                />
              )
            }

            return null
          }) :
          <NullStateMessage message="No Markets Available" /> }
        {!!marketsLength && p.showPagination &&
          <Paginator
            itemsLength={marketsLength}
            itemsPerPage={10}
            location={p.location}
            history={p.history}
            setSegment={this.setSegment}
            pageParam={p.paginationPageParam || null}
          />
        }
      </article>
    )
  }
}
