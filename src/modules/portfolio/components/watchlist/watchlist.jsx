import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Helmet } from 'react-helmet'

import Dropdown from 'modules/common/components/dropdown/dropdown'
import MarketsList from 'modules/markets/components/markets-list'
import Styles from 'modules/portfolio/components/watchlist/watchlist.styles'
import { TYPE_TRADE } from 'modules/market/constants/link-types'

class WatchList extends Component {
  static propTypes = {
    markets: PropTypes.array.isRequired,
    filteredMarkets: PropTypes.array.isRequired,
    isLogged: PropTypes.bool.isRequired,
    hasAllTransactionsLoaded: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    scalarShareDenomination: PropTypes.object.isRequired,
    toggleFavorite: PropTypes.func.isRequired,
    loadMarketsInfo: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      sortOptions: [
        { label: 'Volume', value: 'volume' },
        { label: 'Newest', value: 'newest' },
        { label: 'Fees', value: 'fees' },
        { label: 'Expiring Soon', value: 'expiring' }
      ],
      sortDefault: 'volume',
      sortType: 'volume',
      filterOptions: [
        { label: 'Cryptocurrency', value: 'cryptocurrency' },
        { label: 'Blockchain', value: 'blockchain' },
        { label: 'Bitcoin', value: 'bitcoin' },
        { label: 'Ethereum', value: 'ethereum' }
      ],
      filterDefault: 'cryptocurrency',
      filterType: 'cryptocurrency',
    }

    this.changeDropdown = this.changeDropdown.bind(this)
  }

  changeDropdown(value) {
    let { sortType } = this.state
    let { filterType } = this.state

    this.state.sortOptions.forEach((type, ind) => {
      if (type.value === value) {
        sortType = value
      }
    })

    this.state.filterOptions.forEach((type, ind) => {
      if (type.value === value) {
        filterType = value
      }
    })

    this.setState({ sortType, filterType })
  }

  render() {
    const p = this.props
    const s = this.state

    return (
      <section className={Styles.WatchList}>
        <Helmet>
          <title>Watching</title>
        </Helmet>
        <div
          className={Styles.WatchList__SortBar}
        >
          <div
            className={Styles['WatchList__SortBar-title']}
          >
            Watching
          </div>
          <div
            className={Styles['WatchList__SortBar-sort']}
          >
            <Dropdown default={s.sortDefault} options={s.sortOptions} onChange={this.changeDropdown} />
          </div>
          <div
            className={Styles['WatchList__SortBar-filter']}
          >
            <Dropdown default={s.filterDefault} options={s.filterOptions} onChange={this.changeDropdown} />
          </div>
        </div>
        <MarketsList
          isLogged={p.isLogged}
          markets={p.markets}
          filteredMarkets={p.filteredMarkets}
          location={p.location}
          history={p.history}
          scalarShareDenomination={p.scalarShareDenomination}
          toggleFavorite={p.toggleFavorite}
          loadMarketsInfo={p.loadMarketsInfo}
          linkType={TYPE_TRADE}
        />
      </section>
    )
  }
}

export default WatchList
