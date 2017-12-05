import React, { Component } from 'react'
import PropTypes from 'prop-types'
// import { ChevronDown, ChevronUp } from 'modules/common/components/icons/icons'

import * as d3 from 'd3'
import ReactFauxDOM from 'react-faux-dom'

import { isEqual } from 'lodash'

import Styles from 'modules/market/components/market-outcome-charts--candlestick/market-outcome-charts--candlestick.styles'

export default class MarketOutcomeCandlestick extends Component {
  static propTypes = {
    marketPriceHistory: PropTypes.array.isRequired,
    outcomeMin: PropTypes.number.isRequired,
    outcomeMax: PropTypes.number.isRequired,
    orderBookMid: PropTypes.number.isRequired,
    marketMin: PropTypes.number.isRequired,
    marketMax: PropTypes.number.isRequired,
    hoveredPrice: PropTypes.any,
    updateHoveredPrice: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)

    this.state = {
      chart: null,
      chartWidth: 0,
      yScale: null,
      hoveredPeriod: {},
      hoveredPrice: null
    }

    this.drawChart = this.drawChart.bind(this)
  }

  componentDidMount() {
    this.drawChart()

    window.addEventListener('resize', this.drawChart)
  }

  componentDidUpdate(prevProps, prevState) {
    if (!isEqual(prevProps.marketPriceHistory, this.props.marketPriceHistory)) this.drawChart()

    if (!isEqual(prevProps.hoveredPrice, this.props.hoveredPrice)) this.updateHoveredPriceCrosshair(this.props.hoveredPrice, this.state.yScale, this.state.chartWidth)
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.drawChart)
  }

  updateHoveredPriceCrosshair(hoveredPrice, yScale, chartWidth) {
    if (hoveredPrice == null) {
      d3.select('#candlestick_crosshairs').style('display', 'none')
      d3.select('#hovered_candlestick_price_label').text('')
    } else {
      d3.select('#candlestick_crosshairs').style('display', null)
      d3.select('#candlestick_crosshairY')
        .attr('x1', 0)
        .attr('y1', yScale(hoveredPrice))
        .attr('x2', chartWidth)
        .attr('y2', yScale(hoveredPrice))
      d3.select('#hovered_candlestick_price_label')
        .attr('x', 0)
        .attr('y', yScale(hoveredPrice) + 12)
        .text(hoveredPrice)
    }
  }

  drawChart() {
    if (this.candlestickChart) {
      const fauxDiv = new ReactFauxDOM.Element('div')
      const chart = d3.select(fauxDiv).append('svg')

      const priceHistory = this.props.marketPriceHistory

      const margin = {
        top: 20,
        right: 0,
        bottom: 30,
        left: 50,
        stick: 5,
        tickOffset: 10
      }

      const width = this.candlestickChart.clientWidth
      const height = this.candlestickChart.clientHeight

      chart.attr('id', 'outcome_candlestick')

      chart.attr('width', width)
      chart.attr('height', height)

      const xDomain = priceHistory.reduce((p, dataPoint) => [...p, dataPoint.period], [])

      // Ensure yDomain always has midmarket price at the center
      // TODO -- can probably clean this up...is a copy/paste from an older implementation
      // Can only use odd numbered intervals so midpoint is always centered
      const intervals = 5
      const allowedFloat = 2 // TODO -- set this to the precision

      // Determine bounding diff
      const maxDiff = Math.abs(this.props.orderBookMid - this.props.outcomeMax)
      const minDiff = Math.abs(this.props.orderBookMid - this.props.outcomeMin)
      const boundDiff = (maxDiff > minDiff ? maxDiff : minDiff)

      // Set interval step
      const step = boundDiff / ((intervals - 1) / 2)

      const yDomain = new Array(intervals).fill(null).reduce((p, _unused, i) => {
        if (i === 0) return [Number((this.props.orderBookMid - boundDiff).toFixed(allowedFloat))]
        if (i + 1 === Math.round(intervals / 2)) return [...p, this.props.orderBookMid]
        return [...p, Number((p[i - 1] + step).toFixed(allowedFloat))]
      }, [])

      // Candlesticks
      const xScale = d3.scaleTime()
        .domain(d3.extent(xDomain))
        .range([margin.left, width - margin.right - 1])

      const yScale = d3.scaleLinear()
        .domain(d3.extent(yDomain))
        .range([height - margin.bottom, margin.top])

      chart.selectAll('line')
        .data(yDomain)
        .enter()
        .append('line')
        .attr('class', 'tick-line')
        .attr('x1', 0)
        .attr('x2', width)
        .attr('y1', (d, i) => ((height - margin.bottom) / 4) * i)
        .attr('y2', (d, i) => ((height - margin.bottom) / 4) * i)

      chart.selectAll('text')
        .data(yDomain.sort((a, b) => (b - a)))
        .enter()
        .append('text')
        .attr('class', 'tick-value')
        .attr('x', 0)
        .attr('y', (d, i) => ((height - margin.bottom) / 4) * i)
        .attr('dy', margin.tickOffset)
        .attr('dx', 0)
        .text((d, i) => {
          if (i && i !== yDomain.length - 1) return d.toFixed(allowedFloat)
        })

      chart.selectAll('rect.candle')
        .data(priceHistory)
        .enter().append('rect')
        .attr('x', d => xScale(d.period))
        .attr('y', d => yScale(d3.max([d.open, d.close])))
        .attr('height', d => yScale(d3.min([d.open, d.close])) - yScale(d3.max([d.open, d.close])))
        .attr('width', d => (0.5 * (width - (2 * margin.stick))) / priceHistory.length)
        .attr('class', d => d.close > d.open ? 'up-period' : 'down-period') // eslint-disable-line no-confusing-arrow

      chart.selectAll('line.stem')
        .data(priceHistory)
        .enter().append('line')
        .attr('class', 'stem')
        .attr('x1', d => xScale(d.period) + (0.25 * ((width - (2 * margin.stick)) / priceHistory.length)))
        .attr('x2', d => xScale(d.period) + (0.25 * ((width - (2 * margin.stick)) / priceHistory.length)))
        .attr('y1', d => yScale(d.high))
        .attr('y2', d => yScale(d.low))
        .attr('class', d => d.close > d.open ? 'up-period' : 'down-period') // eslint-disable-line no-confusing-arrow

      // Volume
      const yVolumeDomain = priceHistory.reduce((p, dataPoint) => [...p, dataPoint.volume], [])

      const yVolumeScale = d3.scaleLinear()
        .domain(d3.extent(yVolumeDomain))
        .range([height - margin.bottom, margin.top + ((height - margin.bottom) * 0.66)])

      chart.selectAll('rect.volume')
        .data(priceHistory)
        .enter().append('rect')
        .attr('x', d => ((0.05 * (width - (2 * margin.stick))) / priceHistory.length) + xScale(d.period))
        .attr('y', d => yVolumeScale(d.volume))
        .attr('height', d => height - margin.bottom - yVolumeScale(d.volume))
        .attr('width', d => (0.40 * (width - (2 * margin.stick))) / priceHistory.length)
        .attr('class', 'period-volume') // eslint-disable-line no-confusing-arrow

      chart.append('rect')
        .attr('class', 'overlay')
        .attr('width', width)
        .attr('height', height)
        .on('mousemove', () => this.props.updateHoveredPrice(yScale.invert(d3.mouse(d3.select('#outcome_candlestick').node())[1])))
        .on('mouseout', () => this.props.updateHoveredPrice(null))

      chart.selectAll('rect.hover')
        .data(priceHistory)
        .enter().append('rect')
        .attr('x', d => xScale(d.period))
        .attr('y', 0)
        .attr('height', height - margin.bottom)
        .attr('width', d => (0.5 * (width - (2 * margin.stick))) / priceHistory.length)
        .attr('class', 'period-hover')
        .on('mouseover', d => this.setState({ hoveredPeriod: d }))
        .on('mousemove', () => this.props.updateHoveredPrice(yScale.invert(d3.mouse(d3.select('#outcome_candlestick').node())[1])))
        .on('mouseout', () => {
          this.setState({ hoveredPeriod: {} })
          this.props.updateHoveredPrice(null)
        })

      chart.append('text')
        .attr('id', 'hovered_candlestick_price_label')

      const crosshair = chart.append('g')
        .attr('id', 'candlestick_crosshairs')
        .attr('class', 'line')
        .attr('style', { display: 'none' })

      crosshair.append('line')
        .attr('id', 'candlestick_crosshairY')
        .attr('class', 'crosshair')

      this.setState({
        yScale,
        chartWidth: width,
        chart: fauxDiv.toReact()
      })
    }
  }

  render() {
    return (
      <section className={Styles.MarketOutcomeCandlestick}>
        <div
          ref={(candlestickChart) => { this.candlestickChart = candlestickChart }}
          className={Styles.MarketOutcomeCandlestick__chart}
        >
          {this.state.chart}
        </div>
      </section>
    )
  }
}
