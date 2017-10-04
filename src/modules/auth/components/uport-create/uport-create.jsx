import React, { Component } from 'react'

export default class Uport extends Component {
  constructor() {
    super()

    this.setupUport = this.setupUport.bind(this)
  }

  componentWillMount() {
    this.setupUport()
  }

  setupUport() {
    console.log('setupUport')
  }

  render() {
    return (
      <section>
        <span>uPort</span>
      </section>
    )
  }
}
