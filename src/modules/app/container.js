import { connect } from 'react-redux';
import App from 'modules/app/components/app';
import { selectMarketsHeader } from 'modules/markets/selectors/markets-header';
import portfolio from 'modules/portfolio/selectors/portfolio';
import links from 'modules/link/selectors/links';
import { selectNotificationsAndSeenCount } from 'modules/notifications/selectors/notifications';
import { selectTags } from 'modules/markets/selectors/tags';

const mapStateToProps = state => ({
  url: state.url,
  activeView: state.activeView,
  loginAccount: state.loginAccount,
  marketsHeader: selectMarketsHeader(state),
  portfolio: portfolio(),
  links: links(),
  notifications: selectNotificationsAndSeenCount(state),
  tags: selectTags(state)
});

const AppContainer = connect(mapStateToProps)(App);

export default AppContainer;
