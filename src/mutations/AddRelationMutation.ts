import { graphql } from 'react-relay'
import { makeMutation } from '../utils/makeMutation'

interface Props {
  projectId: string
  name: string
  description?: string
  leftModelId: string
  rightModelId: string
  fieldOnLeftModelName: string
  fieldOnRightModelName: string
  fieldOnLeftModelIsList: boolean
  fieldOnRightModelIsList: boolean
  fieldOnLeftModelIsRequired: boolean
  fieldOnRightModelIsRequired: boolean
}

const mutation = graphql`
  mutation AddRelationMutation($input: AddRelationInput!) {
    addRelation(input: $input) {
      relation {
        id
        name
        description
        fieldOnLeftModel {
          id
          name
          isList
          isRequired
        }
        fieldOnRightModel {
          id
          name
          isList
          isRequired
        }
        leftModel {
          id
          name
          namePlural
          itemCount
          fields(first: 1000) {
            edges {
              node {
                id
              }
            }
          }
        }
        rightModel {
          id
          name
          namePlural
          itemCount
          fields(first: 1000) {
            edges {
              node {
                id
              }
            }
          }
        }
      }
      leftModel {
        ...NewRow_model
        ...TypeBox_model
        fields(first: 1000) {
          edges {
            node {
              id
            }
          }
        }
      }
      rightModel {
        ...NewRow_model
        ...TypeBox_model
        fields(first: 1000) {
          edges {
            node {
              id
            }
          }
        }
      }
      relationEdge {
        node {
          id
          name
          description
          fieldOnLeftModel {
            id
            name
            isList
            isRequired
          }
          fieldOnRightModel {
            id
            name
            isList
            isRequired
          }
          leftModel {
            id
            name
            namePlural
            itemCount
            fields(first: 1000) {
              edges {
                node {
                  id
                }
              }
            }
          }
          rightModel {
            id
            name
            namePlural
            itemCount
            fields(first: 1000) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
      project {
        id
        schema
        typeSchema
        relations(first: 1000) {
          edges {
            node {
              id
              name
              description
              fieldOnLeftModel {
                id
                name
                isList
                isRequired
              }
              fieldOnRightModel {
                id
                name
                isList
                isRequired
              }
              leftModel {
                id
                name
                namePlural
                itemCount
              }
              rightModel {
                id
                name
                namePlural
                itemCount
              }
            }
          }
        }
      }
    }
  }
`

function commit(input: Props) {
  return makeMutation({
    mutation,
    variables: { input },
    configs: [
      {
        type: 'RANGE_ADD',
        parentName: 'project',
        parentID: input.projectId,
        connectionName: 'relations',
        edgeName: 'relationEdge',
        rangeBehaviors: { '': 'append' },
      },
      {
        type: 'RANGE_ADD',
        parentName: 'leftModel',
        parentID: input.leftModelId,
        connectionName: 'fields',
        edgeName: 'fieldOnLeftModelEdge',
        rangeBehaviors: { '': 'append' },
      },
      {
        type: 'RANGE_ADD',
        parentName: 'rightModel',
        parentID: input.rightModelId,
        connectionName: 'fields',
        edgeName: 'fieldOnRightModelEdge',
        rangeBehaviors: { '': 'append' },
      },
    ],
  })
}

export default { commit }
