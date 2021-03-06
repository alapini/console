import * as React from 'react'
import Helmet from 'react-helmet'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { clearNotification, showNotification } from '../../actions/notification'
import { Notification, ShowNotificationCallback } from '../../types/utils'
import * as NotificationSystem from 'react-notification-system'
import * as MediaQuery from 'react-responsive'
import MobileScreen from './MobileScreen'
import Alert from '../../components/Window/Alert'

interface Props {
  children: Element
  notification: Notification
  clearNotification: () => any
  showNotification: ShowNotificationCallback
}

class RootView extends React.Component<Props, {}> {
  notificationSystem: any

  componentWillUpdate(nextProps: Props) {
    if (nextProps.notification.level && nextProps.notification.message) {
      const autoDismiss = nextProps.notification.autoDismiss
      this.notificationSystem.addNotification({
        ...nextProps.notification,
        autoDismiss: typeof autoDismiss === 'number' ? autoDismiss : 7,
        dismissible: false,
      })
      this.props.clearNotification()
    }
  }

  componentDidMount() {
    ;(global as any).graphcoolNotification = (message: string) => {
      this.props.showNotification({
        message,
        level: 'info',
        autoDismiss: 0,
      })
    }
  }

  render() {
    return (
      <div style={{ height: '100%' }}>
        <Alert />
        <style jsx global>{`
          .butn {
            @p: .br2, .buttonShadow, .pv12, .ph16, .f14, .fw6, .inlineFlex,
              .itemsCenter, .pointer;
            letter-spacing: 0.3px;
          }
          .butn.primary {
            @p: .bgGreen, .white;
          }
          .butn * + * {
            @p: .ml10;
          }
          .bgAccent {
            @p: .bgGreen;
          }
        `}</style>
        <Helmet titleTemplate="%s | Graphcool" />
        <MediaQuery minWidth={600}>
          {matches => (matches ? this.props.children : <MobileScreen />)}
        </MediaQuery>
        <NotificationSystem ref={this.setRef} />
      </div>
    )
  }

  private setRef = ref => {
    this.notificationSystem = ref
  }
}

const mapStateToProps = (state: any) => {
  return {
    notification: state.notification,
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ clearNotification, showNotification }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(RootView)
