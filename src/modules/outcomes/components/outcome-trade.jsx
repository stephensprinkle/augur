import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import Input from 'modules/common/components/input/input'
import OutcomeTradeSummary from 'modules/outcomes/components/outcome-trade-summary'
import OutcomeTradeAction from 'modules/outcomes/components/outcome-trade-action'
import ComponentNav from 'modules/common/components/component-nav'

import { SHARE, MICRO_SHARE, MILLI_SHARE } from 'modules/market/constants/share-denominations'
import { BUY } from 'modules/transactions/constants/types'
import { BIDS, ASKS } from 'modules/order-book/constants/order-book-order-types'
import { SCALAR } from 'modules/markets/constants/market-types'

import getValue from 'utils/get-value'

export default class OutcomeTrade extends Component {
  static propTypes = {
    selectedShareDenomination: PropTypes.string,
    updateSelectedTradeSide: PropTypes.func,
    marketType: PropTypes.string,
    minLimitPrice: PropTypes.string,
    maxLimitPrice: PropTypes.string,
    submitTrade: PropTypes.func,
    tradeSummary: PropTypes.object
  };

  constructor(props) {
    super(props)

    this.state = {
      timestamp: Date.now(), // Utilized to force a re-render and subsequent update of the input fields' values on `selectedOutcome` change
      shareInputPlaceholder: generateShareInputPlaceholder(props.selectedShareDenomination),
      // maxSharesDenominated: denominateShares(getValue(props, 'selectedOutcome.trade.maxNumShares.value', SHARE, props.selectedShareDenomination)), // NOTE -- this value is not currently used in the component, but may be used later, so leaving here until this decision is finalized
      sharesDenominated: denominateShares(getValue(props, 'selectedOutcome.trade.numShares'), SHARE, props.selectedShareDenomination) || '',
      minLimitPrice: props.marketType && props.marketType === SCALAR ? props.minLimitPrice : 0,
      maxLimitPrice: props.marketType && props.marketType === SCALAR ? props.maxLimitPrice : 1,
      isSharesValueValid: true,
      isLimitPriceValueValid: true,
      incrementAmount: 0.1
    }

    this.updateTimestamp = this.updateTimestamp.bind(this)
    this.updateSelectedNav = this.updateSelectedNav.bind(this)
    this.handleSharesInput = this.handleSharesInput.bind(this)
    this.validateShares = this.validateShares.bind(this)
    this.validatePrice = this.validatePrice.bind(this)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.marketType !== nextProps.marketType) {
      this.setState({
        minLimitPrice: nextProps.marketType && nextProps.marketType === SCALAR ? nextProps.minLimitPrice : 0,
        maxLimitPrice: nextProps.marketType && nextProps.marketType === SCALAR ? nextProps.maxLimitPrice : 1
      })
    }

    const oldTrade = JSON.stringify(getValue(this.props, 'selectedOutcome.trade'))
    const newTrade = JSON.stringify(getValue(nextProps, 'selectedOutcome.trade'))

    if (newTrade !== oldTrade || this.props.selectedShareDenomination !== nextProps.selectedShareDenomination) {
      this.setState({
        shareInputPlaceholder: generateShareInputPlaceholder(nextProps.selectedShareDenomination),
        // maxSharesDenominated: denominateShares(getValue(nextProps, 'selectedOutcome.trade.maxNumShares.value', SHARE, nextProps.selectedShareDenomination)),
        sharesDenominated: denominateShares(getValue(nextProps, 'selectedOutcome.trade.numShares'), SHARE, nextProps.selectedShareDenomination) || ''
      })
    }

    const oldID = getValue(this.props, 'selectedOutcome.id')
    const newID = getValue(nextProps, 'selectedOutcome.id')

    if (oldID !== newID) { // If the outcome selection changes, re-render trade component
      this.updateTimestamp()
    }

    const oldTradeOrders = getValue(this.props, 'tradeSummary.tradeOrders')
    const newTradeOrders = getValue(nextProps, 'tradeSummary.tradeOrders')

    // Currently whenever a trade is submitted, all market's in-process orders are cleared
    // Will re-render trade component upon tradeOrders clearing
    if ((oldTradeOrders.length !== newTradeOrders.length) && newTradeOrders.length === 0) {
      this.updateTimestamp()
    }
  }

  updateTimestamp() { // forces re-render of trade component via key value
    this.setState({ timestamp: Date.now() })
  }

  updateSelectedNav(selectedTradeSide, id) {
    this.props.updateSelectedTradeSide(selectedTradeSide, id)

    const availableOrderType = selectedTradeSide === BUY ? ASKS : BIDS
    const orderBookSide = getValue(this.props, `selectedOutcome.orderBook.${availableOrderType}`)
    const bestOrderPrice = getValue(orderBookSide[0], 'price.value') || ''

    const trade = getValue(this.props, 'selectedOutcome.trade')
    if (trade && trade.updateTradeOrder) {
      if (bestOrderPrice === '') {
        trade.updateTradeOrder(null, bestOrderPrice, selectedTradeSide) // Clears order
        trade.updateTradeOrder(null, null, selectedTradeSide) // Sets to default
      } else {
        trade.updateTradeOrder(null, bestOrderPrice, selectedTradeSide) // Updates to best
      }
    }
  }

  handleSharesInput(value) {
    const trade = getValue(this.props, 'selectedOutcome.trade')
    const valueDenominated = denominateShares(value, this.props.selectedShareDenomination, SHARE)

    trade.updateTradeOrder(valueDenominated, null, trade.side)
  }

  validatePrice(value, trade) {
    if (value != null) {
      if ((value >= parseFloat(this.state.minLimitPrice) && value <= parseFloat(this.state.maxLimitPrice)) || value === '') {
        this.setState({ isLimitPriceValueValid: true })
        trade.updateTradeOrder(null, value, trade.side)
      } else {
        this.setState({ isLimitPriceValueValid: false })
      }
    }
  }

  validateShares(value, trade) {
    if (value != null) {
      if (value >= 0 || value === '') {
        this.handleSharesInput(value)
        this.setState({ isSharesValueValid: true })
      } else {
        this.setState({ isSharesValueValid: false })
      }
    }
  }

  render() {
    const p = this.props
    const s = this.state

    const selectedID = getValue(p, 'selectedOutcome.id')
    const name = getValue(p, 'selectedOutcome.name')
    const trade = getValue(p, 'selectedOutcome.trade')
    const selectedTradeSide = (selectedID && p.selectedTradeSide[selectedID]) || BUY
    const tradeOrder = getValue(p, 'tradeSummary.tradeOrders').find(order => order.data.outcomeID === selectedID)
    const hasFunds = getValue(p, 'tradeSummary.hasUserEnoughFunds')

    return (
      <article className="outcome-trade market-content-scrollable">
        {p.marketType !== SCALAR ?
          <h3>Create Order {name &&
            <span>&mdash; {name}</span>
          }
          </h3> :
          <h3>Create Order</h3>
        }
        {trade &&
          <div
            key={s.timestamp}
            className="outcome-trade-inputs"
          >
            <div className="outcome-trade-inputs-sides">
              <ComponentNav
                fullWidth
                navItems={p.outcomeTradeNavItems}
                selectedNav={selectedTradeSide}
                updateSelectedNav={(side) => { this.updateSelectedNav(side, selectedID) }}
              />
            </div>
            <div className="outcome-trade-inputs-fields">
              <Input
                className={classNames({ 'input-error': !s.isSharesValueValid })}
                placeholder={s.shareInputPlaceholder}
                value={s.sharesDenominated}
                isIncrementable
                incrementAmount={s.incrementAmount}
                updateValue={(value) => {
                  this.validateShares(value, trade)
                }}
                onChange={(value) => {
                  this.validateShares(value, trade)
                }}
              />
              <span>@</span>
              <Input
                className={classNames('trade-price-input', { 'input-error': !s.isLimitPriceValueValid })}
                placeholder="Price"
                value={trade.limitPrice ? trade.limitPrice : ''}
                isIncrementable
                incrementAmount={s.incrementAmount}
                updateValue={(value) => {
                  this.validatePrice(value, trade)
                }}
                onChange={(value) => {
                  this.validatePrice(value, trade)
                }}
              />
            </div>
          </div>
        }
        {!s.isSharesValueValid &&
          <span className="outcome-trade-input-error-message" >
            {`Shares amount must be greater than 0.`}
          </span>
        }
        {!s.isLimitPriceValueValid &&
          <span className="outcome-trade-input-error-message" >
            {`Limit price must be between ${s.minLimitPrice} - ${s.maxLimitPrice}.`}
          </span>
        }
        {tradeOrder && s.isSharesValueValid && s.isLimitPriceValueValid &&
          <OutcomeTradeSummary
            trade={trade}
            tradeOrder={tradeOrder}
          />
        }
        {tradeOrder && s.isSharesValueValid && s.isLimitPriceValueValid &&
          <OutcomeTradeAction
            hasFunds={hasFunds}
            selectedID={selectedID}
            submitTrade={p.submitTrade}
          />
        }
      </article>
    )
  }
}

function denominateShares(shares, fromDenomination, toDenomination) {
  if (shares == null || fromDenomination === toDenomination) {
    return shares
  }

  // Determine numerical representation of from/to values for shares mutation calc
  const options = [SHARE, MILLI_SHARE, MICRO_SHARE]
  let fromValue = 0
  options.some((value, i) => {
    if (value === fromDenomination) {
      fromValue = i
      return true
    }

    return false
  })

  let toValue = 0
  options.some((value, i) => {
    if (value === toDenomination) {
      toValue = i
      return true
    }

    return false
  })

  if (fromValue === toValue) {
    return shares
  } else if (fromValue < toValue) {
    return shares * (1000**(toValue - fromValue))
  }

  // fromValue > toValue
  return shares / (1000**Math.abs(toValue - fromValue))
}

function generateShareInputPlaceholder(denomination) {
  const base = 'Quantity'

  switch (denomination) {
    case (MICRO_SHARE):
      return `${base} (μShare)`
    case (MILLI_SHARE):
      return `${base} (mShare)`
    default:
    case (SHARE):
      return base
  }
}
