import { connect } from 'react-redux'

import MarketOutcomesChart from 'modules/market/components/market-outcomes-chart/market-outcomes-chart'

const mergeProps = (sP, dP, oP) => {
  // const queryParams = parseQuery(ownProps.location.search)
  // const market = selectMarket(queryParams.id) // NOTE -- commented out for mocking sake

  const randomData = () => [
    ...new Array(30)].map(() => [
      (new Date()).getTime() - (Math.random() * ((1000000000000 - 0) + 0)),
      (Math.random() * 1)
    ])
    .sort((a, b) => a[0] - b[0])

  const market = {
    priceHistory: [
      randomData(),
      randomData(),
      randomData(),
      randomData(),
      randomData(),
      randomData(),
      randomData(),
      randomData()
    ]
  }

  return {
    ...oP,
    marketMin: 0,
    marketMax: 1,
    priceHistory: market.priceHistory
  }
}

export default connect(null, null, mergeProps)(MarketOutcomesChart)
