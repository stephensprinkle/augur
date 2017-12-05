import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { Helmet } from 'react-helmet'

// TODO: implement null state for topics list (needs design)
// import NullStateMessage from 'modules/common/components/null-state-message';
import TopicList from 'modules/topics/components/topic-list/topic-list'
import Paginator from 'modules/common/components/paginator/paginator'
import GraphBG from 'modules/common/components/graph-background/graph-background'

import makePath from 'modules/routes/helpers/make-path'
import makeQuery from 'modules/routes/helpers/make-query'

import Styles from 'modules/topics/components/topics-view/topics-view.styles'

import { TOPIC_PARAM_NAME } from 'modules/filter-sort/constants/param-names'
import { MARKETS } from 'modules/routes/constants/views'

import { tween } from 'shifty'

export default class TopicsView extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    isLogged: PropTypes.bool.isRequired,
    isMobile: PropTypes.bool.isRequired,
    topics: PropTypes.array,
    universe: PropTypes.object,
    loginAccount: PropTypes.object
  }

  constructor(props) {
    super(props)

    this.state = {
      lowerBound: null,
      boundedLength: null,
      itemsPerPage: 9,
      heroTopicIndex: null,
      heroTopicOpacity: 0
    }

    this.setSegment = this.setSegment.bind(this)
    this.startCategoryCarousel = this.startCategoryCarousel.bind(this)
    this.stopCategoryCarousel = this.stopCategoryCarousel.bind(this)
  }

  componentDidMount() {
    if (this.props.topics.length > 0) {
      this.startCategoryCarousel()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.topics.length === 0 && nextProps.topics.length > 0) {
      this.startCategoryCarousel()
    }
  }

  componentWillUnmount() {
    this.stopCategoryCarousel()
  }

  setSegment(lowerBound, upperBound, boundedLength) {
    this.setState({
      lowerBound,
      boundedLength
    })
  }

  startCategoryCarousel() {
    this.setState({ heroTopicIndex: 0 })

    const doCarouselTween = (from, to, cb) => tween({
      from: { value: from },
      to: { value: to },
      duration: 500,
      easing: 'easeOutQuad',
      step: (stepObj) => {
        this.setState({ heroTopicOpacity: stepObj.value })
      }
    }).then(cb)

    const waitThenChange = () => {
      this.carouselTimeout = setTimeout(() => {
        doCarouselTween(1, 0, () => {
          const s = this.state
          const p = this.props
          const nextIndex = (s.heroTopicIndex + 1) % p.topics.length
          this.setState({ heroTopicIndex: nextIndex })
          doCarouselTween(0, 1, waitThenChange)
        })
      }, 5000)
    }

    doCarouselTween(0, 1, waitThenChange)
  }

  stopCategoryCarousel() {
    if (this.carouselTimeout) {
      clearTimeout(this.carouselTimeout)
      this.carouselTimeout = null
    }
  }

  render() {
    const p = this.props
    const s = this.state
    const heroTopic = p.topics[s.heroTopicIndex]

    return (
      <section className={Styles.Topics}>
        <Helmet>
          <title>Categories</title>
        </Helmet>
        <GraphBG />
        <div className={Styles.Topics__container}>
          <div className={Styles.TopicsHeading}>
            <h3>Bet on</h3>
            <h2 style={{ opacity: s.heroTopicOpacity }}>
              {heroTopic &&
                <Link
                  to={{
                    pathname: makePath(MARKETS),
                    search: makeQuery({
                      [TOPIC_PARAM_NAME]: heroTopic.topic
                    })
                  }}
                >
                  {heroTopic.topic}
                </Link>
              }
              {!heroTopic && '...'}
            </h2>
            <div className={Styles.TopicsHeading__separator} />
          </div>
          {!!(p.topics && p.topics.length && s.boundedLength) &&
            <TopicList
              topics={p.topics}
              lowerBound={s.lowerBound}
              boundedLength={p.isMobile ? s.boundedLength : s.itemsPerPage}
            />
          }
        </div>
        {!!(p.topics && p.topics.length) &&
          <div className={Styles.Topics__paginator}>
            <Paginator
              itemsLength={p.topics.length}
              itemsPerPage={s.itemsPerPage}
              location={p.location}
              history={p.history}
              setSegment={this.setSegment}
            />
          </div>
        }
      </section>
    )
  }
}
