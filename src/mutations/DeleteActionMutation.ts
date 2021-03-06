import { graphql } from 'react-relay'
import { makeMutation } from '../utils/makeMutation'

interface Props {
  actionId: string
  projectId: string
}

const mutation = graphql`
  mutation DeleteActionMutation($input: DeleteActionInput!) {
    deleteAction(input: $input) {
      project {
        actions(first: 1000) {
          edges {
            node {
              id
            }
          }
        }
      }
      deletedId
    }
  }
`

function commit(input: Props) {
  return makeMutation({
    mutation,
    variables: {
      input: {
        actionId: input.actionId,
      },
    },
    configs: [
      {
        type: 'NODE_DELETE',
        parentName: 'project',
        parentID: input.projectId,
        connectionName: 'actions',
        deletedIDFieldName: 'deletedId',
      },
    ],
  })
}

export default { commit }
