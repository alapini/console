import { Notification } from '../types/utils'
import Constants from '../constants/notification'

export function showNotification(notification: Notification) {
  return {
    type: Constants.SHOW_NOTIFICATION,
    payload: notification,
  }
}

export function clearNotification() {
  return {
    type: Constants.CLEAR_NOTIFICATION,
  }
}
