import * as React from 'react'
import * as cn from 'classnames'
import { createFragmentContainer, graphql } from 'react-relay'
import { Project } from '../../types/types'
import { Link } from 'found'
import MigrateProject from '../../mutations/Schema/MigrateProject'
import MigrationMessages from './MigrationMessages'
const QueryEditor: any = require('./Editor/QueryEditor').QueryEditor
import { showNotification } from '../../actions/notification'
import { connect } from 'react-redux'
import { ShowNotificationCallback } from '../../types/utils'
import { onFailureShowNotification } from '../../utils/relay'
import Loading from '../../components/Loading/Loading'
import { debounce } from 'lodash'
import { smoothScrollTo } from '../../utils/smooth'
import SchemaExport from './SchemaExport'

interface Props {
  project: Project
  relay: any
  showNotification: ShowNotificationCallback
  onTypesChange: (changed: boolean) => void
  onEnumsChange: (enums: boolean) => void
  setBlur: (active: boolean) => void
  scroll: number
  showEnums: boolean
}

export interface MigrationMessage {
  type: string
  action: string
  name: string
  description: string
  subDescriptions: MigrationSubMessage[]
}

export interface MigrationSubMessage {
  type: string
  action: string
  name: string
  description: string
}

export interface MigrationError {
  type: string
  field: string
  description: string
}

interface State {
  typeSchema: string
  enumSchema: string
  beta: boolean
  isDryRun: boolean
  messages: MigrationMessage[]
  errors: MigrationError[]
  loading: boolean
}

class SchemaEditor extends React.Component<Props, State> {
  private lastDidChangeType = false
  private lastDidChangeEnum = false
  private editor: any
  private containerRef = null
  private handleScroll = debounce(() => {
    // const container = this.containerRef
    // const scrollPercentage =
    //   100 *
    //   container.scrollTop /
    //   (container.scrollHeight - container.clientHeight)
  }, 100)
  constructor(props: Props) {
    super(props)
    this.state = {
      // schema: sortSchema(props.project.schema, props.project.models.edges.map(edge => edge.node)),
      enumSchema: props.project.enumSchema,
      typeSchema: this.addFrontmatter(props.project.typeSchema),
      beta: true,
      isDryRun: true,
      messages: [],
      errors: [],
      loading: false,
    }
  }
  componentWillReceiveProps(nextProps: Props) {
    if (this.props.scroll !== nextProps.scroll) {
      this.scrollToPercentage(nextProps.scroll)
    }
    if (this.props.project.typeSchema !== nextProps.project.typeSchema) {
      this.setState(
        {
          typeSchema: this.addFrontmatter(
            nextProps.project.typeSchema,
            nextProps,
          ),
        } as State,
      )
    }
    if (this.props.project.enumSchema !== nextProps.project.enumSchema) {
      this.setState({ enumSchema: nextProps.project.enumSchema } as State)
    }
    if (this.props.project.version !== nextProps.project.version) {
      this.setState(
        {
          typeSchema: this.addFrontmatter(
            nextProps.project.typeSchema,
            nextProps,
          ),
        } as State,
      )
    }
  }
  scrollToPercentage(scroll) {
    const container = this.containerRef
    // const scrollPercentage =
    //   100 *
    //   container.scrollTop /
    //   (container.scrollHeight - container.clientHeight)
    const newScrollTop =
      scroll * (container.scrollHeight - container.clientHeight) / 100
    smoothScrollTo(this.containerRef, newScrollTop, 300)
  }
  componentDidUpdate() {
    // type
    const didChangeType = this.didChangeType()
    if (didChangeType !== this.lastDidChangeType) {
      this.props.onTypesChange(didChangeType)
    }
    this.lastDidChangeType = didChangeType

    // enum
    const didChangeEnum = this.didChangeEnum()
    if (didChangeEnum !== this.lastDidChangeEnum) {
      this.props.onEnumsChange(didChangeEnum)
    }
    this.lastDidChangeEnum = didChangeEnum
  }
  didChangeType() {
    return (
      this.state.typeSchema !==
      this.addFrontmatter(this.props.project.typeSchema)
    )
  }
  didChangeEnum() {
    return this.state.enumSchema !== this.props.project.enumSchema
  }
  didChange() {
    return this.didChangeType() || this.didChangeEnum()
  }
  render() {
    const { project } = this.props
    const { beta, isDryRun, loading } = this.state

    const schema = this.props.showEnums
      ? this.state.enumSchema
      : this.state.typeSchema

    const didChange = this.didChange()

    return (
      <div className={cn('schema-editor', { beta })}>
        <style jsx={true}>{`
          .schema-editor {
            @p: .w100, .bgDarkerBlue, .flex, .flexColumn, .relative, .h100;
          }
          .schema-editor :global(.CodeMirror) {
            @p: .hAuto;
            padding-top: 25px;
            padding-left: 16px;
            padding-bottom: 0;
            padding-right: 0;
          }
          .editor-wrapper {
            @p: .flexAuto, .overflowAuto, .relative, .nosb;
          }
          .loader {
            @p: .absolute, .top0, .right0, .bottom0, .left0, .flex,
              .justifyCenter, .itemsCenter;
          }
          .schema-editor:not(.beta) :global(.CodeMirror-cursor) {
            @p: .dn;
          }
          .schema-editor :global(.CodeMirror-selected) {
            background: rgba(255, 255, 255, .1);
          }

          .footer {
            @p: .flex, .w100, .pa25, .relative, .bgDarkerBlue, .flexFixed;
            /*&:after {
              @p: .absolute, .left0, .right0, .top0;
              z-index: 30;
              margin-top: -36px;
              content: "";
              height: 36px;
              background: linear-gradient(to top, $darkerBlue, rgba(15,32,46,0));
              pointer-events: none;
            }*/
          }
          .footer.editing {
            @p: .bgBlack30, .pa16, .justifyBetween;
          }
          .schema-editor :global(.schema-button) {
            @p: .bgWhite04, .fw6, .f14, .white50, .ttu, .br2, .pointer, .o50,
              .mr16;
            padding: 7px 9px 8px 11px;
            letter-spacing: 0.53px;
            transition: $duration linear opacity;
          }
          .schema-editor :global(.button:hover) {
            @p: .o100;
          }
          .soon-editable {
            @p: .absolute, .ma25, .top0, .right0, .ttu, .f14, .fw6, .white30;
          }
          .apply-changes {
            @p: .bgGreen, .br2, .white, .f16, .pa10, .pointer;
          }
          .cancel {
            @p: .pa10, .white40, .f16, .pointer;
          }
          .cli-button {
            @p: .absolute, .top0, .right0, .mt25, .z5;
          }
        `}</style>
        <div
          className="editor-wrapper"
          onScroll={this.handleScroll}
          ref={ref => {
            this.containerRef = ref
          }}
        >
          <QueryEditor
            value={schema}
            onEdit={this.handleSchemaChange}
            onRunQuery={this.updateSchema}
            onEditorInstance={instance => {
              this.editor = instance
            }}
            readOnly={!beta}
          />
          {loading &&
            <div className="loader">
              <Loading color="white" />
            </div>}
          <div className="cli-button">
            <Link
              className="schema-button"
              to={`/${project.name}/schema/cli-guide`}
            >
              Edit Schema from CLI
            </Link>
          </div>
        </div>
        {didChange
          ? <div>
              {(this.state.messages.length > 0 ||
                this.state.errors.length > 0) &&
                <MigrationMessages
                  messages={this.state.messages}
                  errors={this.state.errors}
                />}
              <div className="footer editing">
                <div className="cancel" onClick={this.reset}>
                  Reset Changes
                </div>
                <div className="apply-changes" onClick={this.updateSchema}>
                  {isDryRun ? 'Preview ' : 'Apply '}
                  Changes
                </div>
              </div>
            </div>
          : <div className="footer">
              <SchemaExport
                schema={project.schema}
                projectName={project.name}
                projectId={project.id}
              >
                <div className="schema-button">Export Schema</div>
              </SchemaExport>
              <Link className="schema-button" to={`/${project.name}/clone`}>
                Clone Project
              </Link>
            </div>}
        {!beta && <div className="soon-editable">soon editable</div>}
      </div>
    )
  }
  private updateSchema = () => {
    const { typeSchema, enumSchema, isDryRun } = this.state
    const schema = typeSchema + '\n' + enumSchema
    // const newSchema = this.addFrontmatter(schema)
    const newSchema = schema
    this.setState({ loading: true } as State)
    MigrateProject.commit({
      newSchema,
      isDryRun,
      force: true,
      projectId: this.props.project.id,
    })
      .then(res => {
        if (isDryRun) {
          this.setState(
            {
              messages: res.migrateProject.migrationMessages,
              isDryRun: false,
              errors: res.migrateProject.errors,
              loading: false,
            } as State,
          )
        } else {
          if (
            res.migrateProject.errors &&
            res.migrateProject.errors.length > 0
          ) {
            res.migrateProject.errors.forEach(error => {
              this.props.showNotification({
                level: 'error',
                message: (
                  <div>
                    <span className="fw6">{error.type}:</span>{' '}
                    {error.description}
                  </div>
                ),
              })
            })
          }
          this.setState(
            {
              messages: [],
              isDryRun: true,
              errors: [],
              loading: false,
            } as State,
          )
        }
      })
      .catch(transaction => {
        onFailureShowNotification(transaction, this.props.showNotification)
        this.setState({ loading: false } as State)
      })
  }

  private reset = () => {
    const { project } = this.props
    this.setState(
      {
        errors: [],
        messages: [],
        isDryRun: true,
        enumSchema: project.enumSchema,
        typeSchema: this.addFrontmatter(project.typeSchema, this.props),
      } as State,
    )
  }

  private addFrontmatter(schema, props?: Props) {
    const { version, id } = props ? props.project : this.props.project
    return (
      `# projectId: ${id}
# version: ${version}\n\n` + schema
    )
  }

  private handleSchemaChange = newSchema => {
    if (!this.state.beta) {
      return
    }
    const schemaName = this.props.showEnums ? 'enumSchema' : 'typeSchema'
    this.setState(
      {
        [schemaName]: newSchema,
        errors: [],
        messages: [],
        isDryRun: true,
      } as State,
    )
  }
}

const SchemaEditorRedux = connect(null, { showNotification })(SchemaEditor)

export default createFragmentContainer(SchemaEditorRedux, {
  project: graphql`
    fragment SchemaEditor_project on Project {
      id
      schema
      typeSchema
      enumSchema
      name
      version
      models(first: 1000) {
        edges {
          node {
            id
            name
          }
        }
      }
    }
  `,
})
