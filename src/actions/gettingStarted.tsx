import * as React from 'react' // tslint:disable-line
import { Example } from '../types/types'
import { Dispatch, StateTree, ReduxThunk, ReduxAction } from '../types/reducers'
import { GettingStartedState, Step } from './../types/gettingStarted'
let UpdateCustomerOnboardingStatusMutation
// needed for jest tests
if (process.env.NODE_ENV !== 'test') {
  UpdateCustomerOnboardingStatusMutation = require('../mutations/UpdateCustomerOnboardingStatusMutation')
    .default
}

import Constants from '../constants/gettingStarted'
import IconNotification from '../components/IconNotification/IconNotification'
import cuid from 'cuid'
import { showPopup } from '../actions/popup'
import { forceShowNewRow } from './databrowser/ui'
import { fetchQuery } from '../relayEnvironment'

export function showDonePopup() {
  const id = cuid()
  const element = <IconNotification id={id} />
  return showPopup({ id, element, blurBackground: false })
}

export function update(
  step: Step,
  skipped: boolean,
  onboardingStatusId: string,
  selectedExample?: Example,
): ReduxAction {
  const payload = {
    gettingStartedState: new GettingStartedState({
      step,
      skipped,
      onboardingStatusId,
      selectedExample,
    }),
  }
  return { type: Constants.UPDATE, payload }
}

function updateReduxAndRelay(
  dispatch: (action: ReduxAction) => any,
  gettingStarted: Step,
  gettingStartedSkipped: boolean,
  onboardingStatusId: string,
  gettingStartedExample: Example = null,
): Promise<{}> {
  return new Promise((resolve, reject) => {
    if (typeof UpdateCustomerOnboardingStatusMutation !== 'undefined') {
      UpdateCustomerOnboardingStatusMutation.commit({
        onboardingStatusId,
        gettingStarted,
        gettingStartedSkipped: ['STEP5_DONE', 'STEP6_CLOSED'].includes(
          gettingStarted,
        )
          ? false
          : gettingStartedSkipped,
        gettingStartedCompleted: ['STEP5_DONE', 'STEP6_CLOSED'].includes(
          gettingStarted,
        ),
        gettingStartedExample,
      })
        .then(() => {
          dispatch(
            update(
              gettingStarted,
              gettingStartedSkipped,
              onboardingStatusId,
              gettingStartedExample,
            ),
          )

          // refresh intercom messages once onboarding done/skipped
          if (
            (window as any).Intercom &&
            (gettingStarted === 'STEP6_CLOSED' || gettingStartedSkipped)
          ) {
            setTimeout(() => (window as any).Intercom('update'), 2000)
          }

          resolve()
        })
        .catch(err => {
          // Error
          reject()
        })
    }
  })
}

export function nextStep(): ReduxThunk {
  return (dispatch: Dispatch, getState: () => StateTree): Promise<{}> => {
    const {
      step,
      skipped,
      onboardingStatusId,
      selectedExample,
    } = getState().gettingStarted.gettingStartedState
    const currentStepIndex = GettingStartedState.steps.indexOf(step)
    const nextStepValue = GettingStartedState.steps[currentStepIndex + 1]

    return updateReduxAndRelay(
      dispatch,
      nextStepValue,
      skipped,
      onboardingStatusId,
      selectedExample,
    )
  }
}

export function previousStep(): ReduxThunk {
  return (dispatch: (action: ReduxAction) => any, getState): Promise<{}> => {
    const {
      step,
      skipped,
      onboardingStatusId,
      selectedExample,
    } = getState().gettingStarted.gettingStartedState
    const currentStepIndex = GettingStartedState.steps.indexOf(step)
    const nextStepValue = GettingStartedState.steps[currentStepIndex - 1]

    return updateReduxAndRelay(
      dispatch,
      nextStepValue,
      skipped,
      onboardingStatusId,
      selectedExample,
    )
  }
}

export function skip(): (
  dispatch: (action: ReduxAction) => any,
  getState: any,
) => Promise<{}> {
  return (dispatch: (action: ReduxAction) => any, getState): Promise<{}> => {
    const {
      step,
      onboardingStatusId,
    } = getState().gettingStarted.gettingStartedState

    return updateReduxAndRelay(dispatch, step, true, onboardingStatusId)
  }
}

export function fetchGettingStartedState(): (
  dispatch: (action: ReduxAction) => any,
) => Promise<void> {
  return (dispatch: (action: ReduxAction) => any): Promise<void> => {
    const query = `
      query {
        viewer {
          user {
            crm {
              onboardingStatus {
                id
                gettingStarted
                gettingStartedSkipped
                gettingStartedExample
              }
            }
          }
        }
      }`
    const variables = {}

    return fetchQuery({ text: query }, variables).then(({ data }: any) => {
      const {
        id,
        gettingStarted,
        gettingStartedSkipped,
        gettingStartedExample,
      } = data.viewer.user.crm.onboardingStatus
      dispatch(
        update(
          gettingStarted,
          gettingStartedSkipped,
          id,
          gettingStartedExample,
        ),
      )
    })
  }
}
// dependencies so that the steps' tethers are shown
// 'STEP0_OVERVIEW',
// -> nothing needed
// 'STEP1_CREATE_POST_MODEL',
// -> nothing needed
// 'STEP2_CLICK_CREATE_FIELD_IMAGEURL',
// -> route: http://domain/projectName/models/Post/schema
//   'STEP2_ENTER_FIELD_NAME_IMAGEURL',
// -> route: http://domain/projectName/models/Post/schema/create
//   'STEP2_SELECT_TYPE_IMAGEURL',
// -> route: http://domain/projectName/models/Post/schema/create
//   'STEP2_CLICK_CONFIRM_IMAGEURL',
// -> route: http://domain/projectName/models/Post/schema/create
//   'STEP2_CREATE_FIELD_DESCRIPTION',
// -> route: http://domain/projectName/models/Post/schema
//   'STEP3_CLICK_DATA_BROWSER',
// -> route: http://domain/projectName/models/Post/schema
//   'STEP3_CLICK_ADD_NODE1',
// -> route: http://domain/projectName/models/Post/databrowser
//   -> redux: newRowActive: true
// 'STEP3_CLICK_ENTER_IMAGEURL',
// -> route: http://domain/projectName/models/Post/databrowser
//   -> redux: newRowActive: true
// 'STEP3_CLICK_ENTER_DESCRIPTION',
// -> route: http://domain/projectName/models/Post/databrowser
//   -> redux: newRowActive: true
// 'STEP3_CLICK_SAVE_NODE1',
// -> route: http://domain/projectName/models/Post/databrowser
//   -> redux: newRowActive: true
// 'STEP3_CLICK_ADD_NODE2',
// -> route: http://domain/projectName/models/Post/databrowser
//   'STEP4_CLICK_PLAYGROUND',
// -> nothing needed
// 'STEP4_CLICK_BEGIN_PART1',
// -> route: http://domain/projectName/playground
//   'STEP4_WAITING_PART1',
// -> route: http://domain/projectName/playground
//   'STEP4_CLICK_TEASER_PART2',
// -> route: http://domain/projectName/playground
//   'STEP4_CLICK_BEGIN_PART2',
// -> route: http://domain/projectName/playground
//   'STEP4_WAITING_PART2',
// -> route: http://domain/projectName/playground
//   'STEP4_CLICK_TEASER_STEP5',
// -> route: http://domain/projectName/playground
//   'STEP5_SELECT_EXAMPLE',
// -> route: http://domain/projectName/playground
//   'STEP5_WAITING',
// -> route: http://domain/projectName/playground
//   'STEP5_DONE',
// -> route: http://domain/projectName/playground
//   'STEP6_CLOSED',
// -> route: http://domain/projectName/playground

export function showCurrentStep(router: InjectedFoundRouter, params: any) {
  return (dispatch, getState) => {
    const { step } = getState().gettingStarted.gettingStartedState

    switch (step) {
      case 'STEP0_OVERVIEW':
        break
      case 'STEP1_CREATE_POST_MODEL':
        break
      case 'STEP2_CLICK_CREATE_FIELD_IMAGEURL':
        router.push(`/${params.projectName}/models/Post/schema`)
        break
      case 'STEP2_ENTER_FIELD_NAME_IMAGEURL':
        router.push(`/${params.projectName}/models/Post/schema/create`)
        break
      case 'STEP2_SELECT_TYPE_IMAGEURL':
        router.push(`/${params.projectName}/models/Post/schema/create`)
        break
      case 'STEP2_CLICK_CONFIRM_IMAGEURL':
        router.push(`/${params.projectName}/models/Post/schema/create`)
        break
      case 'STEP2_CREATE_FIELD_DESCRIPTION':
        router.push(`/${params.projectName}/models/Post/schema`)
        break
      case 'STEP3_CLICK_DATA_BROWSER':
        router.push(`/${params.projectName}/models/Post/schema`)
        break
      case 'STEP3_CLICK_ADD_NODE1':
        dispatch(forceShowNewRow())
        router.push(`/${params.projectName}/models/Post/databrowser`)
        break
      case 'STEP3_CLICK_ENTER_IMAGEURL':
        dispatch(forceShowNewRow())
        router.push(`/${params.projectName}/models/Post/databrowser`)
        break
      case 'STEP3_CLICK_ENTER_DESCRIPTION':
        dispatch(forceShowNewRow())
        router.push(`/${params.projectName}/models/Post/databrowser`)
        break
      case 'STEP3_CLICK_SAVE_NODE1':
        dispatch(forceShowNewRow())
        router.push(`/${params.projectName}/models/Post/databrowser`)
        break
      case 'STEP3_CLICK_ADD_NODE2':
        router.push(`/${params.projectName}/models/Post/databrowser`)
        break
      case 'STEP4_CLICK_PLAYGROUND':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP4_CLICK_BEGIN_PART1':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP4_WAITING_PART1':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP4_CLICK_TEASER_PART2':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP4_CLICK_BEGIN_PART2':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP4_WAITING_PART2':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP4_CLICK_TEASER_STEP5':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP5_SELECT_EXAMPLE':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP5_WAITING':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP5_DONE':
        router.push(`/${params.projectName}/playground`)
        break
      case 'STEP6_CLOSED':
        break
    }
  }
}
