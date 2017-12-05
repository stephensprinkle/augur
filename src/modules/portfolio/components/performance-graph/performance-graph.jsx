import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Highcharts from 'highcharts'
import noData from 'highcharts/modules/no-data-to-display'

import Dropdown from 'modules/common/components/dropdown/dropdown'

import debounce from 'utils/debounce'
import getValue from 'utils/get-value'
import { formatEther } from 'utils/format-number'
import { formatDate } from 'utils/format-date'

import Styles from 'modules/portfolio/components/performance-graph/performance-graph.styles'

class PerformanceGraph extends Component {
  static propTypes = {
    performanceData: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = {
      graphType: 'Total',
      graphTypeOptions: [
        { label: 'Total', value: 'Total' },
        { label: 'Total Realized', value: 'Realized' },
        { label: 'Total Unrealized', value: 'Unrealized' }
      ],
      graphTypeDefault: 'Total',
      graphPeriod: 'day',
      graphPeriodOptions: [
        { label: 'Past 24hrs', value: 'day' },
        { label: 'Past Week', value: 'week' },
        { label: 'Past Month', value: 'month' },
        { label: 'All', value: 'all' }
      ],
      graphPeriodDefault: 'day'
    }

    this.changeDropdown = this.changeDropdown.bind(this)
    this.updateChart = this.updateChart.bind(this)
    this.updateChartDebounced = debounce(this.updateChart.bind(this))
  }

  componentDidMount() {
    noData(Highcharts)

    Highcharts.setOptions({
      lang: {
        thousandsSep: ','
      }
    })
    const id = 'performance_graph_chart'

    this.performanceGraph = new Highcharts.Chart(id, {
      title: {
        text: null
      },
      chart: {
        backgroundColor: '#1e1a31',
        spacingLeft: 0,
        spacingRight: 0,
      },
      events: {
        load() {
          this.customTexts = []

          const text = this.renderer.text(
            'Responsive text',
            this.xAxis[0].toPixels(20),
            this.yAxis[0].toPixels(60)
          )
            .css({
              fontSize: '10px'
            })
            .add()

          this.customTexts.push(text)
        },
        redraw() {
          this.customTexts[0].attr({
            x: this.xAxis[0].toPixels(15),
            y: this.yAxis[0].toPixels(50)
          })
        }
      },
      lang: {
        noData: 'No performance history.'
      },
      rangeSelector: { selected: 1 },
      xAxis: {
        visible: true,
        type: 'datetime',
        crosshair: {
          width: 4,
        },
        labels: {
          formatter() {
            return formatDate(new Date(this.value)).simpleDate
          },
          style: {
            color: '#ffffff',
            fontSize: '0.875rem',
          }
        },
        tickLength: 6,
        showFirstLabel: false,
        showLastLabel: false,
        tickPositioner(low, high) {
          const positions = [low, this.dataMin, this.dataMax, high]
          return positions
        }
      },
      yAxis: {
        visible: true,
        showFirstLabel: false,
        showLastLabel: true,
        title: {
          text: null,
        },
        opposite: false,
        labels: {
          align: 'left',
          y: 15,
          x: 5,
          format: '{value} ETH',
          formatter() {
            return formatEther(this.value).full
          },
          style: {
            color: '#ffffff',
            fontSize: '0.875rem'
          },
        },
        tickPositioner() {
          // default
          let positions = [this.dataMin, (this.dataMax / 2), Math.ceil(this.dataMax) + (this.dataMax * 0.05)]

          if (this.series[0] && this.series[0].length > 0) {
            const { data } = this.series[0]
            const i = data.length / 2
            const median = i % 1 === 0 ? (data[i - 1] + data[i]) / 2 : data[Math.floor(i)]
            positions = [this.dataMin, median, Math.ceil(this.dataMax) + (this.dataMax * 0.05)]
          }
          return positions
        }
      },
      plotOptions: {
        series: {
          color: 'white',
          fillColor: {
            linearGradient: [0, 0, 0, '100%'],
            stops: [
              [0, Highcharts.Color('#dbdae1').setOpacity(0.25).get('rgba')],
              [0.5, Highcharts.Color('#dbdae1').setOpacity(0.15).get('rgba')],
              [1, Highcharts.Color('#dbdae1').setOpacity(0).get('rgba')]
            ]
          }
        }
      },
      legend: {
        enabled: false
      },
      tooltip: {
        positioner(labelWidth, labelHeight, point) {
          // tooltip wants to position top left of crosshair, this optionally
          // positions the inverse if the label will render off chart
          return { x: point.plotX - labelWidth < 0 ? point.plotX : point.plotX - labelWidth, y: point.plotY < labelHeight ? point.plotY + (labelHeight * 0.9) : point.plotY - (labelHeight * 0.9) }
        },
        backgroundColor: 'rgba(255,255,255,0)',
        borderWidth: 0,
        headerFormat: '',
        style: {
          fontSize: '1rem'
        },
        shadow: false,
        shape: 'none',
        pointFormat: '<b style="color:{point.color}">{point.y} ETH</b>',
        valueDecimals: 2
      },
      credits: {
        enabled: false
      },
    })

    window.addEventListener('resize', this.updateChartDebounced)

    this.updateChart()
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.graphType !== this.state.graphType || prevState.graphPeriod !== this.state.graphPeriod) this.updateChart()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateChartDebounced)
  }

  changeDropdown(value) {
    let newType = this.state.graphType
    let newPeriod = this.state.graphPeriod

    this.state.graphTypeOptions.forEach((type, ind) => {
      if (type.value === value) {
        newType = value
      }
    })

    this.state.graphPeriodOptions.forEach((period, ind) => {
      if (period.value === value) {
        newPeriod = value
      }
    })

    this.setState({ graphType: newType, graphPeriod: newPeriod })
  }

  updateChart() {
    (getValue(this.props.performanceData, `${this.state.graphType}.${this.state.graphPeriod}`) || []).forEach((series, i) => {
      if (this.performanceGraph.series[i] == null) {
        this.performanceGraph.addSeries({
          type: 'area',
          color: '#ffffff',
          className: Styles.PerformanceGraph__Series,
          marker: {
            fillColor: 'white',
            lineColor: 'white',
          },
          name: series.name,
          data: series.data
        }, false)
      } else {
        this.performanceGraph.series[i].setData(series.data, false)
      }
    })

    this.performanceGraph.redraw()
  }

  render() {
    const s = this.state

    return (
      <section
        className={Styles.PerformanceGraph}
      >
        <div
          className={Styles.PerformanceGraph__SortBar}
        >
          <div
            className={Styles['PerformanceGraph__SortBar-title']}
          >
            Profits/losses
          </div>
          <div
            className={Styles['PerformanceGraph__SortBar-dropdowns']}
          >
            <Dropdown default={s.graphTypeDefault} options={s.graphTypeOptions} onChange={this.changeDropdown} />
            <Dropdown default={s.graphPeriodDefault} options={s.graphPeriodOptions} onChange={this.changeDropdown} />
          </div>
        </div>
        <div id="performance_graph_chart" />
      </section>
    )
  }
}

export default PerformanceGraph
