import * as React from 'react'
import tracker from '../../utils/metrics'
import * as cookiestore from 'cookiestore'
import jwtDecode from 'jwt-decode'
import { updateNetworkLayer } from '../../relayEnvironment'

interface Props {
  location: any
}

export default class TokenRedirectView extends React.Component<Props, {}> {
  componentWillMount() {
    const { query } = this.props.location

    let { redirect } = query
    const { token, cli } = query
    if (token) {
      const data = jwtDecode(token)
      tracker.reset()
      cookiestore.set('graphcool_auth_token', token)
      cookiestore.set('graphcool_customer_id', data.clientId)
      if (typeof cli !== 'undefined') {
        localStorage.setItem('graphcool_from_cli', 'true')
      }
      updateNetworkLayer()
      redirect = redirect || ''
      window.location.href = window.location.origin + redirect
    }
  }

  render() {
    return (
      <div>
        <style jsx={true}>{`
          div {
            @p: .pa60, .f20;
          }
        `}</style>
        Redirecting...
      </div>
    )
  }
}
