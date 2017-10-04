import { connect } from 'react-redux'
import Uport from 'modules/auth/components/uport-connect/uport-connect'

const mapStateToProps = state => ({
  isMobile: state.isMobile
})

export default connect(mapStateToProps)(Uport)
