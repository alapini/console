import * as React from 'react'
import { $p, $v } from 'graphcool-styles'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { showNotification } from '../../actions/notification'
import { ShowNotificationCallback } from '../../types/utils'
import { onFailureShowNotification } from '../../utils/relay'
import Auth0Lock from 'auth0-lock'
import * as cookiestore from 'cookiestore'
import AuthenticateCustomerMutation, {
  Response,
} from '../../mutations/AuthenticateCustomerMutation'
import tracker from '../../utils/metrics'
import { ConsoleEvents } from 'graphcool-metrics'

interface Props {
  showNotification: ShowNotificationCallback
  initialScreen: 'login' | 'signUp'
  renderInElement: boolean
  successCallback: (response: Response) => void
  location: any
}

const ELEMENT_ID = 'auth0-lock'

class Auth0LockWrapper extends React.Component<Props, {}> {
  lock: any

  componentDidMount() {
    let prefill
    if (this.props.location.query && this.props.location.query.email) {
      prefill = {
        email: this.props.location.query.email,
      }
    }

    this.lock = new Auth0Lock(__AUTH0_CLIENT_ID__, __AUTH0_DOMAIN__, {
      closable: false,
      additionalSignUpFields: [
        {
          name: 'name',
          icon: 'http://i.imgur.com/JlNtkke.png',
          placeholder: 'enter your full name',
        },
      ],
      theme: {
        logo: require('../../assets/graphics/logo-auth0.png'),
        primaryColor: $v.green,
      },
      languageDictionary: {
        title: 'Graphcool',
        emailInputPlaceholder: 'your@companymail.com',
      },
      auth: {
        params: { scope: 'openid email name user_metadata' },
      },
      initialScreen: this.props.initialScreen,
      container: this.props.renderInElement ? ELEMENT_ID : null,
      prefill,
    })

    this.lock.on('authenticated', authResult => {
      this.lock.hide()

      window.localStorage.setItem(
        'graphcool_auth_provider',
        authResult.idTokenPayload.sub,
      )

      AuthenticateCustomerMutation.commit({ auth0IdToken: authResult.idToken })
        .then(async response => {
          cookiestore.set(
            'graphcool_auth_token',
            response.authenticateCustomer.token,
          )
          cookiestore.set(
            'graphcool_customer_id',
            response.authenticateCustomer.user.id,
          )

          tracker.track(ConsoleEvents.Authentication.completed())

          this.props.successCallback(response.authenticateCustomer)
        })
        .catch(transaction => {
          this.lock.show()

          onFailureShowNotification(transaction, this.props.showNotification)

          tracker.track(
            ConsoleEvents.Authentication.failed({
              idToken: authResult.idToken,
            }),
          )
        })
    })

    this.lock.show()
  }

  componentWillUnmount() {
    this.lock.hide()
  }

  render() {
    return this.props.renderInElement
      ? <div id={ELEMENT_ID} className="" />
      : <div className={$p.dn} />
  }
}

const mapDispatchToProps = dispatch => {
  return bindActionCreators({ showNotification }, dispatch)
}

export default connect(null, mapDispatchToProps)(Auth0LockWrapper)
