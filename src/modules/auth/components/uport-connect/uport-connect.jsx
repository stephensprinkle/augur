import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Connect, SimpleSigner } from 'uport-connect'
import QRCode from 'qrcode.react'

import debounce from 'utils/debounce'
import getValue from 'utils/get-value'

import Styles from 'modules/auth/components/uport-connect/uport-connect.styles'

export default class Uport extends Component {
  static propTypes = {
    isMobile: PropTypes.bool.isRequired
  }

  constructor() {
    super()

    this.state = {
      connectURI: '',
      qrSize: 0
    }

    this.uport = new Connect('AUGUR -- DEV', {
      clientId: '2ofGiHuZhhpDMAQeDxjoDhEsUQd1MayECgd',
      signer: SimpleSigner('04d2d00de9e20f674285be0b28e118f9b4829ebe845e3719acc4731bc03578b1')
    })

    this.setQRSize = this.setQRSize.bind(this)
    this.debouncedSetQRSize = debounce(this.setQRSize.bind(this))
  }

  componentWillMount() {
    const REQ = {
      requested: ['name'],
      notifcations: true
    }

    const URI_HANDLER = connectURI => this.setState({ connectURI })

    this.uport.requestCredentials(REQ, URI_HANDLER)
      .then((userProfile) => {
        console.log('userProfile -- ', userProfile)
        // TODO -- dispatch account update
      })

    window.addEventListener('resize', this.debouncedSetQRSize)
  }

  componentDidMount() {
    this.setQRSize()
  }

  setQRSize() {
    const width = getValue(this, 'qrWrapper.clientWidth')
    if (width) this.setState({ qrSize: this.props.isMobile ? width / 1.2 : width / 2 })
  }

  render() {
    const s = this.state

    return (
      <section
        className={Styles.uPort}
      >
        <h1>Scan To Connect</h1>
        <div
          ref={(qrWrapper) => { this.qrWrapper = qrWrapper }}
          className={Styles.uPort__qrcode}
        >
          <QRCode
            value={s.connectURI}
            size={s.qrSize}
          />
        </div>
      </section>
    )
  }
}
