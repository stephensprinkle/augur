import React from 'react'

import Input from 'modules/common/components/input/input'
import InputDropdown from 'modules/common/components/input-dropdown/input-dropdown'

import { Deposit } from 'modules/common/components/icons/icons'

import Styles from 'modules/new-account/components/account-deposit/account-deposit.styles'

const AccountDeposit = p => (
  <section className={Styles.AccountDeposit}>
    <div className={Styles.AccountDeposit__heading}>
      <h1>Account: Deposit</h1>
      { Deposit }
    </div>
    <div className={Styles.AccountDeposit__main}>
      <div className={Styles.AccountDeposit__description}>
        <p>
          Deposit Ethereum or Reputation from another account into your Trading Account connected with Augur.
        </p>
        <a href="#">Use Shapeshift</a>
      </div>
      <div className={Styles.AccountDeposit__form}>
        <div className={Styles.AccountDeposit__formTopRow}>
          <div className={Styles.AccountDeposit__inputContain}>
            <label>Select Currency</label>
            <InputDropdown
              label="Select Currency"
              options={["ETH", "REP"]}
              type="text"
            />
          </div>
          <div className={Styles.AccountDeposit__inputContain}>
            <label>Quantity</label>
            <Input
              label="Quantity"
              type="number"
            />
          </div>
        </div>
        <div className={Styles.AccountDeposit__formBottomRow}>
          <div className={Styles.AccountDeposit__inputContain}>
            <label>Recipient Account Address</label>
            <Input
              label="Recipient Account Address"
              type="text"
            />
          </div>
        </div>
        <button className={Styles.AccountDeposit__submitButton}>
          Deposit
        </button>
      </div>
    </div>
  </section>
)

export default AccountDeposit
