import React, { Component } from 'react'
import PropTypes from 'prop-types'
import BigNumber from 'bignumber.js'

import Input from 'modules/common/components/input/input'
import InputDropdown from 'modules/common/components/input-dropdown/input-dropdown'

import { Withdraw } from 'modules/common/components/icons/icons'

import { ETH, REP } from 'modules/account/constants/asset-types'

import isAddress from 'modules/auth/helpers/is-address'

import Styles from 'modules/account/components/account-withdraw/account-withdraw.styles'

export default class AccountWithdraw extends Component {
  static propTypes = {
    isMobileSmall: PropTypes.bool.isRequired,
    eth: PropTypes.object.isRequired,
    rep: PropTypes.object.isRequired,
    transferFunds: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.DEFAULT_STATE = {
      animationSpeed: 0,
      upperBound: props.eth.value,
      selectedAsset: ETH,
      amount: '',
      address: '',
      isValid: null,
      isAmountValid: null,
      isAddressValid: null
    }

    this.state = this.DEFAULT_STATE

    this.validateAmount = this.validateAmount.bind(this)
    this.validateAddress = this.validateAddress.bind(this)
    this.validateForm = this.validateForm.bind(this)
    this.submitForm = this.submitForm.bind(this)
  }

  validateAmount(amount) {
    const sanitizedAmount = sanitizeArg(amount)

    if (isNaN(parseFloat(sanitizedAmount)) || !isFinite(sanitizedAmount) || (sanitizedAmount > this.state.upperBound || sanitizedAmount <= 0)) {
      this.setState({
        amount: sanitizedAmount,
        isAmountValid: false
      })

      this.validateForm(false, this.state.isAddressValid)

      return
    }

    this.setState({
      amount: sanitizedAmount,
      isAmountValid: true
    })

    this.validateForm(true, this.state.isAddressValid)
  }

  validateAddress(address) {
    const sanitizedAddress = sanitizeArg(address)

    if (!isAddress(sanitizedAddress)) {
      this.setState({
        address: sanitizedAddress,
        isAddressValid: false
      })

      this.validateForm(this.state.isAmountValid, false)

      return
    }

    this.setState({
      address: sanitizedAddress,
      isAddressValid: true
    })

    this.validateForm(this.state.isAmountValid, true)
  }

  validateForm(isAmountValid, isAddressValid) {
    if (isAmountValid && isAddressValid) {
      this.setState({
        isValid: true
      })
    } else {
      this.setState({
        isValid: false
      })
    }
  }

  submitForm() {
    const s = this.state
    const p = this.props

    if (s.isValid) {
      const stringedAmount = s.amount instanceof BigNumber ? s.amount.toString() : s.amount
      p.transferFunds(stringedAmount, s.selectedAsset, s.address)
      this.setState(this.DEFAULT_STATE)
    }
  }

  render() {
    const p = this.props
    const s = this.state

    return (
      <section className={Styles.AccountWithdraw}>
        <div className={Styles.AccountWithdraw__heading}>
          <h1>Account: Withdraw</h1>
          { Withdraw }
        </div>
        <div className={Styles.AccountWithdraw__main}>
          <div className={Styles.AccountWithdraw__description}>
            <p>
              Withdraw Ethereum or Reputation from another account into your Trading Account connected with Augur.
            </p>
            <a href="https://shapeshift.io/">Use Shapeshift</a>
          </div>
          <div className={Styles.AccountWithdraw__form}>
            <div className={Styles.AccountWithdraw__formTopRow}>
              <div className={Styles.AccountWithdraw__inputContain}>
                <label htmlFor="currency">
                  Select Currency
                  <InputDropdown
                    name="currency"
                    className={Styles.AccountWithdraw__dropdown}
                    label="Select Currency"
                    options={['ETH', 'REP']}
                    default="ETH"
                    type="text"
                    isMobileSmall={p.isMobileSmall}
                    onChange={(type) => {
                      const selectedAsset = (type === 'ETH') ? ETH : REP
                      const upperBound = (type === 'ETH') ? p.eth.value : p.rep.value
                      this.setState({
                        selectedAsset,
                        upperBound
                      })
                    }}
                  />
                </label>
              </div>
              <div className={Styles.AccountWithdraw__inputContain}>
                <label htmlFor="quantity">
                  Quantity
                  <Input
                    name="quantity"
                    label="Quantity"
                    type="number"
                    isIncrementable
                    incrementAmount={1}
                    max={s.upperBound}
                    min={0.1}
                    value={s.amount}
                    updateValue={amount => this.validateAmount(amount)}
                    onChange={amount => this.validateAmount(amount)}
                  />
                </label>
              </div>
            </div>
            <div className={Styles.AccountWithdraw__formBottomRow}>
              <div className={Styles.AccountWithdraw__inputContain}>
                <label htmlFor="address">
                  Recipient Account Address
                  <Input
                    name="address"
                    label="Recipient Account Address"
                    type="text"
                    value={s.address}
                    updateValue={address => this.validateAddress(address)}
                    onChange={address => this.validateAddress(address)}
                  />
                </label>
              </div>
            </div>
            <button
              className={Styles.AccountWithdraw__submitButton}
              disabled={!s.isValid}
              onClick={this.submitForm}
            >
              Withdraw
            </button>
          </div>
        </div>
      </section>
    )
  }
}

function sanitizeArg(arg) {
  return (arg == null || arg === '') ? '' : arg
}
