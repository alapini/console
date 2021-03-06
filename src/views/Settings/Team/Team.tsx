import * as React from 'react'
import { createFragmentContainer, graphql } from 'react-relay'
import { Viewer, Seat } from '../../../types/types'
import EmptyRow from './EmptyRow'
import MemberRow from './MemberRow'
import DeleteCollaboratorMutation from '../../../mutations/DeleteCollaboratorMutation'
import { ShowNotificationCallback } from '../../../types/utils'
import { connect } from 'react-redux'
import { showNotification } from '../../../actions/notification'
import { onFailureShowNotification } from '../../../utils/relay'
import { billingInfo } from '../Billing/billing_info'

interface Props {
  viewer: Viewer
  showNotification: ShowNotificationCallback
  params: any
}

class Team extends React.Component<Props, {}> {
  render() {
    const seats = this.props.viewer.project.seats.edges.map(edge => edge.node)
    const plan = this.getPlan()
    const availableSeats = this.getSeatsForPlan(plan)
    let seatsForDisplayEmptyRows = availableSeats
    if (availableSeats < 0) {
      seatsForDisplayEmptyRows = seats.length + 3
    }

    const numberOfEmptyRows = Math.min(
      seatsForDisplayEmptyRows - seats.length,
      3,
    )
    const seatsLeftForDisplayInfo =
      availableSeats < 0 ? availableSeats : availableSeats - seats.length

    const numbers = []
    for (let i = 0; i < numberOfEmptyRows; i++) {
      numbers.push(i)
    }

    return (
      <div className="container">
        <style jsx={true}>{`
          .container {
            @inherit: .br, .ph38, .pt60;
            max-width: 700px;
            border-color: rgba(229, 229, 229, 1);
          }
        `}</style>
        {seats.map(seat =>
          <MemberRow key={seat.email} seat={seat} onDelete={this.deleteSeat} />,
        )}
        <div className="mt38">
          {numbers.map(i =>
            <EmptyRow
              key={i}
              hasAddFunctionality={i === 0}
              numberOfLeftSeats={i === 0 && seatsLeftForDisplayInfo}
              projectId={i === 0 && this.props.viewer.project.id}
            />,
          )}
        </div>
      </div>
    )
  }

  private getSeatsForPlan(plan: string) {
    const seats = billingInfo[plan].maxSeats
    return seats || 2
  }

  private getPlan() {
    const freeId = '2017-02-free'
    const projects = this.props.viewer.user.crm.customer.projects.edges.map(
      edge => edge.node,
    )
    const project = projects.find(
      p => p.systemProjectId === this.props.viewer.project.id,
    )
    if (!project) {
      return freeId
    }
    const billing = project.projectBillingInformation
    if (!billing) {
      return freeId
    }
    const { plan } = billing
    if (!plan) {
      return freeId
    }

    return plan
  }

  private deleteSeat = (seat: Seat) => {
    graphcoolConfirm(
      'This will remove the user with email ' +
        seat.email +
        ' as a collaborator from this project',
    ).then(() => {
      DeleteCollaboratorMutation.commit({
        projectId: this.props.viewer.project.id,
        email: seat.email,
      })
        .then(() => {
          this.props.showNotification({
            message: 'Removed collaborator with email: ' + seat.email,
            level: 'success',
          })
        })
        .catch(transaction => {
          onFailureShowNotification(transaction, this.props.showNotification)
        })
    })
  }
}

const mappedTeam = connect(null, { showNotification })(Team)

export default createFragmentContainer(mappedTeam, {
  viewer: graphql`
    fragment Team_viewer on Viewer {
      project: projectByName(projectName: $projectName) {
        id
        seats(first: 1000) {
          edges {
            node {
              id
              name
              email
              isOwner
              status
            }
          }
        }
      }
      user {
        crm {
          customer {
            projects(first: 1000) {
              edges {
                node {
                  id
                  systemProjectId
                  name
                  projectBillingInformation {
                    plan
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
})
