/* eslint jsx-a11y/label-has-for: 0 */
/* eslint react/no-array-index-key: 0 */

import React, { Component } from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import BigNumber from 'bignumber.js'
import { augur } from 'services/augurjs'

import InputDropdown from 'modules/common/components/input-dropdown/input-dropdown'

import { BID, ASK } from 'modules/transactions/constants/types'
import { BINARY, CATEGORICAL, SCALAR } from 'modules/markets/constants/market-types'

import getValue from 'utils/get-value'

import Styles from 'modules/create-market/components/create-market-form-liquidity/create-market-form-liquidity.styles'
import StylesForm from 'modules/create-market/components/create-market-form/create-market-form.styles'

const PRECISION = 4

export default class CreateMarketLiquidity extends Component {

  static propTypes = {
    newMarket: PropTypes.object.isRequired,
    updateNewMarket: PropTypes.func.isRequired,
    validateNumber: PropTypes.func.isRequired,
    addOrderToNewMarket: PropTypes.func.isRequired,
    availableEth: PropTypes.string.isRequired,
    isMobileSmall: PropTypes.bool.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      errors: {
        quantity: [],
        price: []
      },
      isOrderValid: false,
      orderPrice: '',
      orderQuantity: '',
      orderEstimate: '',
      minPrice: new BigNumber(0),
      maxPrice: new BigNumber(1),
      selectedOutcome: this.props.newMarket.type === SCALAR ? 0 : '',
      selectedNav: BID,
    }

    this.handleAddOrder = this.handleAddOrder.bind(this)
    // this.handleRemoveOrder = this.handleRemoveOrder.bind(this)
    this.updatePriceBounds = this.updatePriceBounds.bind(this)
    this.updateSeries = this.updateSeries.bind(this)
    this.sortOrderBook = this.sortOrderBook.bind(this)
    this.updateInitialLiquidityCosts = this.updateInitialLiquidityCosts.bind(this)
    this.validateForm = this.validateForm.bind(this)
    this.updateOrderEstimate = this.updateOrderEstimate.bind(this)
  }

  componentWillMount() {
    this.updatePriceBounds(this.props.newMarket.type, this.state.selectedOutcome, this.state.selectedNav, this.props.newMarket.orderBookSorted, this.props.newMarket.scalarSmallNum, this.props.newMarket.scalarBigNum)
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.newMarket.orderBook !== nextProps.newMarket.orderBook) this.sortOrderBook(nextProps.newMarket.orderBook)
    if (this.props.newMarket.orderBookSorted !== nextProps.newMarket.orderBookSorted) this.updateSeries(nextProps.newMarket.orderBookSorted)
  }

  componentWillUpdate(nextProps, nextState) {
    if (this.props.newMarket.type !== nextProps.newMarket.type ||
      this.props.newMarket.scalarSmallNum !== nextProps.newMarket.scalarSmallNum ||
      this.props.newMarket.scalarBigNum !== nextProps.newMarket.scalarBigNum ||
      this.props.newMarket.orderBookSorted !== nextProps.newMarket.orderBookSorted ||
      this.state.selectedNav !== nextState.selectedNav ||
      this.state.selectedOutcome !== nextState.selectedOutcome
    ) {
      this.updatePriceBounds(nextProps.newMarket.type, nextState.selectedOutcome, nextState.selectedNav, nextProps.newMarket.orderBookSorted, nextProps.newMarket.scalarSmallNum, nextProps.newMarket.scalarBigNum)
    }

    if (this.state.orderQuantity !== nextState.orderQuantity || this.state.orderPrice !== nextState.orderPrice) {
      let orderEstimate = ''
      if (nextState.orderQuantity instanceof BigNumber && nextState.orderPrice instanceof BigNumber) {
        orderEstimate = `${nextState.orderQuantity.times(nextState.orderPrice).toNumber()} ETH`
      }

      this.updateOrderEstimate(orderEstimate)
    }
  }

  handleAddOrder() {
    if (this.state.isOrderValid) {
      this.props.addOrderToNewMarket({
        outcome: this.state.selectedOutcome,
        type: this.state.selectedNav,
        price: this.state.orderPrice,
        quantity: this.state.orderQuantity
      })

      this.updateInitialLiquidityCosts({
        type: this.state.selectedNav,
        price: this.state.orderPrice,
        quantity: this.state.orderQuantity
      })

      this.setState({
        orderPrice: '',
        orderQuantity: ''
      }, this.validateForm)
    }
  }

  // handleRemoveOrder(type, orderToRemove, i) {
  //   const orderToRemoveIndex = this.props.newMarket.orderBook[this.state.selectedOutcome].findIndex(order => orderToRemove.price === order.price && orderToRemove.quantity === order.quantity)

  //   this.props.removeOrderFromNewMarket({ outcome: this.state.selectedOutcome, index: orderToRemoveIndex })

  //   this.updateInitialLiquidityCosts(this.props.newMarket.orderBook[this.state.selectedOutcome][orderToRemoveIndex], true)
  // }

  updatePriceBounds(type, selectedOutcome, selectedSide, orderBook, scalarSmallNum, scalarBigNum) {
    const oppositeSide = selectedSide === BID ? ASK : BID
    const ZERO = new BigNumber(0)
    const ONE = new BigNumber(1)
    const precision = new BigNumber(10**-PRECISION)
    let minPrice
    let maxPrice

    if (selectedOutcome != null) {
      if (type === SCALAR) {
        if (selectedSide === BID) {
          // Minimum Price
          minPrice = scalarSmallNum

          // Maximum Price
          if (orderBook[selectedOutcome] && orderBook[selectedOutcome][oppositeSide] && orderBook[selectedOutcome][oppositeSide].length) {
            maxPrice = orderBook[selectedOutcome][oppositeSide][0].price.minus(precision)
          } else {
            maxPrice = scalarBigNum
          }
        } else {
          // Minimum Price
          if (orderBook[selectedOutcome] && orderBook[selectedOutcome][oppositeSide] && orderBook[selectedOutcome][oppositeSide].length) {
            minPrice = orderBook[selectedOutcome][oppositeSide][0].price.plus(precision)
          } else {
            minPrice = scalarSmallNum
          }

          // Maximum Price
          maxPrice = scalarBigNum
        }
      } else if (selectedSide === BID) {
        // Minimum Price
        minPrice = ZERO

        // Maximum Price
        if (orderBook[selectedOutcome] && orderBook[selectedOutcome][oppositeSide] && orderBook[selectedOutcome][oppositeSide].length) {
          maxPrice = orderBook[selectedOutcome][oppositeSide][0].price.minus(precision)
        } else {
          maxPrice = ONE
        }
      } else {
        // Minimum Price
        if (orderBook[selectedOutcome] && orderBook[selectedOutcome][oppositeSide] && orderBook[selectedOutcome][oppositeSide].length) {
          minPrice = orderBook[selectedOutcome][oppositeSide][0].price.plus(precision)
        } else {
          minPrice = ZERO
        }

        // Maximum Price
        maxPrice = ONE
      }
    }

    this.setState({ minPrice, maxPrice })
  }

  sortOrderBook(orderBook) {
    const orderBookSorted = Object.keys(orderBook).reduce((p, outcome) => {
      if (p[outcome] == null) p[outcome] = {}

      // Filter Orders By Type
      orderBook[outcome].forEach((order) => {
        if (p[outcome][order.type] == null) p[outcome][order.type] = []
        p[outcome][order.type].push({ price: order.price, quantity: order.quantity })
      })

      // Sort Order By Price
      Object.keys(p[outcome]).forEach((type) => {
        if (type === BID) p[outcome][type] = p[outcome][type].sort((a, b) => b.price - a.price)
        if (type === ASK) p[outcome][type] = p[outcome][type].sort((a, b) => a.price - b.price)
      })

      return p
    }, {})

    this.props.updateNewMarket({ orderBookSorted })
  }

  updateSeries(orderBook) {
    const orderBookSeries = Object.keys(orderBook).reduce((p, outcome) => {
      if (p[outcome] == null) p[outcome] = {}

      Object.keys(orderBook[outcome]).forEach((type) => {
        if (p[outcome][type] == null) p[outcome][type] = []

        let totalQuantity = new BigNumber(0)

        orderBook[outcome][type].forEach((order) => {
          const matchedPriceIndex = p[outcome][type].findIndex(existing => existing[0] === order.price.toNumber())

          totalQuantity = totalQuantity.plus(order.quantity)

          if (matchedPriceIndex > -1) {
            p[outcome][type][matchedPriceIndex][1] = totalQuantity.toNumber()
          } else {
            p[outcome][type].push([order.price.toNumber(), totalQuantity.toNumber()])
          }
        })

        p[outcome][type].sort((a, b) => a[0] - b[0])
      })

      return p
    }, {})

    this.props.updateNewMarket({ orderBookSeries })
  }

  updateInitialLiquidityCosts(order, shouldReduce) {
    const minPrice = this.props.newMarket.type === SCALAR ? this.props.newMarket.scalarSmallNum : 0
    const maxPrice = this.props.newMarket.type === SCALAR ? this.props.newMarket.scalarBigNum : 1
    const shareBalances = this.props.newMarket.outcomes.map(outcome => 0)
    let outcome
    let initialLiquidityEth
    let initialLiquidityGas
    let initialLiquidityFees

    switch (this.props.newMarket.type) {
      case BINARY:
        outcome = this.state.selectedOutcome === 'Yes' ? 1 : 0
        break
      case SCALAR:
        outcome = this.state.selectedOutcome
        break
      default:
        // categorical
        this.props.newMarket.outcomes.forEach((outcomeName, index) => {
          if (this.state.selectedOutcome === outcomeName) outcome = index
        })
    }

    const orderInfo = {
      orderType: order.type === BID ? 0 : 1,
      outcome,
      shares: order.quantity,
      price: order.price,
      tokenBalance: this.props.availableEth,
      minPrice,
      maxPrice,
      marketCreatorFeeRate: this.props.newMarket.settlementFee,
      reportingFeeRate: 0,
      shareBalances,
      marketOrderBook: this.props.newMarket.orderBook
    }
    const action = augur.trading.simulateTrade(orderInfo)
    // NOTE: Fees are going to always be 0 because we are only opening orders, and there is no costs associated with opening orders other than the escrowed ETH and the gas to put the order up.
    if (shouldReduce) {
      initialLiquidityEth = this.props.newMarket.initialLiquidityEth.minus(order.price.times(order.quantity))
      initialLiquidityGas = this.props.newMarket.initialLiquidityGas.minus(new BigNumber(action.gasFees))
      // initialLiquidityFees = this.props.newMarket.initialLiquidityFees.minus(new BigNumber(action.feeEth))
    } else {
      initialLiquidityEth = this.props.newMarket.initialLiquidityEth.plus(order.quantity.times(order.price))
      initialLiquidityGas = this.props.newMarket.initialLiquidityGas.plus(new BigNumber(action.gasFees))
      // initialLiquidityFees = this.props.newMarket.initialLiquidityFees.plus(new BigNumber(action.feeEth))
    }

    this.props.updateNewMarket({ initialLiquidityEth, initialLiquidityGas, initialLiquidityFees })
  }

  validateForm(orderQuantityRaw, orderPriceRaw) {
    const sanitizeValue = (value, type) => {
      if (value == null) {
        if (type === 'quantity') {
          return this.state.orderQuantity
        }
        return this.state.orderPrice
      } else if (!(value instanceof BigNumber) && value !== '') {
        return new BigNumber(value)
      }

      return value
    }

    const orderQuantity = sanitizeValue(orderQuantityRaw, 'quantity')
    const orderPrice = sanitizeValue(orderPriceRaw)

    const errors = {
      quantity: [],
      price: []
    }
    let isOrderValid

    // Validate Quantity
    if (orderQuantity !== '' && orderPrice !== '' && orderPrice.times(orderQuantity).plus(this.props.newMarket.initialLiquidityEth).greaterThan(new BigNumber(this.props.availableEth))) {
      // Done this way so both inputs are in err
      errors.quantity.push('Insufficient funds')
      errors.price.push('Insufficient funds')
    } else if (orderQuantity !== '' && orderQuantity.lessThanOrEqualTo(new BigNumber(0))) {
      errors.quantity.push('Quantity must be positive')
    } else if (orderPrice !== '') {
      const bids = getValue(this.props.newMarket.orderBookSorted[this.state.selectedOutcome], `${BID}`)
      const asks = getValue(this.props.newMarket.orderBookSorted[this.state.selectedOutcome], `${ASK}`)

      if (this.props.newMarket.type !== SCALAR) {
        if (this.state.selectedNav === BID && asks && asks.length && orderPrice.greaterThanOrEqualTo(asks[0].price)) {
          errors.price.push(`Price must be less than best ask price of: ${asks[0].price.toNumber()}`)
        } else if (this.state.selectedNav === ASK && bids && bids.length && orderPrice.lessThanOrEqualTo(bids[0].price)) {
          errors.price.push(`Price must be greater than best bid price of: ${bids[0].price.toNumber()}`)
        } else if (orderPrice.greaterThan(this.state.maxPrice)) {
          errors.price.push('Price cannot exceed 1')
        } else if (orderPrice.lessThan(this.state.minPrice)) {
          errors.price.push('Price cannot be below 0')
        }
      } else if (this.state.selectedNav === BID && asks && asks.length && orderPrice.greaterThanOrEqualTo(asks[0].price)) {
        errors.price.push(`Price must be less than best ask price of: ${asks[0].price.toNumber()}`)
      } else if (this.state.selectedNav === ASK && bids && bids.length && orderPrice.lessThanOrEqualTo(bids[0].price)) {
        errors.price.push(`Price must be greater than best bid price of: ${bids[0].price.toNumber()}`)
      } else if (orderPrice.greaterThan(this.state.maxPrice)) {
        errors.price.push(`Price cannot exceed ${this.state.maxPrice.toNumber()}`)
      } else if (orderPrice.lessThan(this.state.minPrice)) {
        errors.price.push(`Price cannot be below ${this.state.minPrice.toNumber()}`)
      }
    }

    if (this.state.selectedOutcome === '' || orderQuantity === '' || orderPrice === '' || errors.quantity.length || errors.price.length) {
      isOrderValid = false
    } else {
      isOrderValid = true
    }

    this.setState({
      errors,
      isOrderValid,
      orderQuantity,
      orderPrice
    })
  }

  updateOrderEstimate(orderEstimate) {
    this.setState({ orderEstimate })
  }

  render() {
    const p = this.props
    const s = this.state

    const errors = Array.from(new Set([...s.errors.quantity, ...s.errors.price]))

    return (
      <ul className={StylesForm.CreateMarketForm__fields}>
        <li className={Styles.CreateMarketLiquidity__settlement}>
          <label htmlFor="cm__input--settlement">
            <span>Settlement Fee</span>
            { p.newMarket.validations[p.newMarket.currentStep].settlementFee.length &&
              <span className={StylesForm.CreateMarketForm__error}>{ p.newMarket.validations[p.newMarket.currentStep].settlementFee }</span>
            }
          </label>
          <input
            id="cm__input--settlement"
            type="number"
            value={p.newMarket.settlementFee}
            placeholder="0%"
            onChange={e => p.validateNumber('settlementFee', e.target.value, 'settlement fee', 0, 100, 1)}
          />
        </li>
        <li>
          <label>
            <span>Add Order for Initial Liquidity</span>
          </label>
          <p>Recommended for adding liquidity to market.</p>
        </li>
        <li className={Styles.CreateMarketLiquidity__order}>
          <div className={Styles['CreateMarketLiquidity__order-form']}>
            <ul className={Styles['CreateMarketLiquidity__order-form-header']}>
              <li className={classNames({ [`${Styles.active}`]: s.selectedNav === BID })}>
                <button onClick={() => this.setState({ selectedNav: BID })}>Buy</button>
              </li>
              <li className={classNames({ [`${Styles.active}`]: s.selectedNav === ASK })}>
                <button onClick={() => this.setState({ selectedNav: ASK })}>Sell</button>
              </li>
            </ul>
            <ul className={Styles['CreateMarketLiquidity__order-form-body']}>
              { p.newMarket.type === BINARY &&
                <li>
                  <label>Outcome</label>
                  <ul className={classNames(Styles['CreateMarketLiquidity__radio-buttons'], StylesForm['CreateMarketForm__radio-buttons'])}>
                    <li>
                      <button
                        className={classNames({ [`${StylesForm.active}`]: s.selectedOutcome === 'Yes' })}
                        onClick={() => this.setState({ selectedOutcome: 'Yes' })}
                      >Yes
                      </button>
                    </li>
                    <li>
                      <button
                        className={classNames({ [`${StylesForm.active}`]: s.selectedOutcome === 'No' })}
                        onClick={() => this.setState({ selectedOutcome: 'No' })}
                      >No
                      </button>
                    </li>
                  </ul>
                </li>
              }
              { p.newMarket.type === CATEGORICAL &&
                <li>
                  <label>Outcome</label>
                  <InputDropdown
                    className={Styles['CreateMarketLiquidity__outcomes-categorical']}
                    label="Choose an Outcome"
                    default=""
                    options={p.newMarket.outcomes.filter(outcome => outcome !== '')}
                    onChange={value => this.setState({ selectedOutcome: value })}
                    isMobileSmall={this.props.isMobileSmall}
                  />
                </li>
              }
              <li>
                <label htmlFor="cm__input--quantity">Quantity</label>
                <input
                  className={classNames({ [`${StylesForm.error}`]: s.errors.quantity.length })}
                  id="cm__input--quantity"
                  type="number"
                  step={10**-PRECISION}
                  placeholder="0.0000 Shares"
                  value={s.orderQuantity instanceof BigNumber ? s.orderQuantity.toNumber() : s.orderQuantity}
                  onChange={e => this.validateForm(e.target.value, undefined)}
                />
              </li>
              <li>
                <label htmlFor="cm__input--limit-price">Limit Price</label>
                <input
                  className={classNames({ [`${StylesForm.error}`]: s.errors.price.length })}
                  id="cm__input--limit-price"
                  type="number"
                  step={10**-PRECISION}
                  placeholder="0.0000 ETH"
                  value={s.orderPrice instanceof BigNumber ? s.orderPrice.toNumber() : s.orderPrice}
                  onChange={e => this.validateForm(undefined, e.target.value)}
                />
              </li>
              <li>
                <label>Est. Cost</label>
                <div className={Styles['CreateMarketLiquidity__order-est']}>{ s.orderEstimate }</div>
              </li>
              <li>
                { errors.map((error, i) => <p key={i} className={StylesForm.error}>{error}</p>) }
              </li>
              <li className={Styles['CreateMarketLiquidity__order-add']}>
                <button
                  disabled={!s.isOrderValid}
                  onClick={this.handleAddOrder}
                >Add Order
                </button>
              </li>
            </ul>
          </div>
          <div className={Styles['CreateMarketLiquidity__order-graph']}>
            <p>Order graph</p>
          </div>
        </li>
      </ul>
    )
  }
}
