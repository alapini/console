import React, { PropTypes } from 'react'
import Relay from 'react-relay'
import TypeSelection from './TypeSelection'
import Icon from 'components/Icon/Icon'
import Loading from 'react-loading'
import AddFieldMutation from 'mutations/AddFieldMutation'
import classes from './FieldPopup.scss'

class FieldPopup extends React.Component {

  static propTypes = {
    field: PropTypes.object,
    close: PropTypes.func.isRequired,
    modelId: PropTypes.string.isRequired,
    params: PropTypes.object.isRequired,
    allModels: PropTypes.array.isRequired,
  }

  static contextTypes = {
    gettingStartedState: PropTypes.object.isRequired,
  }

  constructor (props) {
    super(props)

    const field = props.field || {}

    this.state = {
      loading: false,
      fieldName: field.fieldName || '',
      typeIdentifier: field.typeIdentifier || 'Int',
      isRequired: field.isRequired || false,
      isList: field.isList || false,
      enumValues: field.enumValues || [],
      defaultValue: field.fieldName || null,
    }
  }

  componentWillMount () {
    window.addEventListener('keydown', this._listenForKeys, false)
  }

  componentWillUnmount () {
    window.removeEventListener('keydown', this._listenForKeys, false)
  }

  _listenForKeys = (e) => {
    if (e.keyCode === 13 && e.target === document.body) {
      this._submit()
    } else if (e.keyCode === 27 && e.target === document.body) {
      this.props.close()
    }
  }

  _submit () {
    if (!this._isValid()) {
      return
    }

    this.setState({ loading: true })

    const {
      fieldName,
      typeIdentifier,
      enumValues,
      isList,
      isRequired,
      defaultValue,
    } = this.state

    Relay.Store.commitUpdate(new AddFieldMutation({
      modelId: this.props.modelId,
      fieldName,
      typeIdentifier,
      enumValues,
      isList,
      isRequired,
      defaultValue,
    }), {
      onSuccess: (response) => {
        analytics.track('models/fields: created field', {
          project: this.props.params.projectName,
          model: this.props.params.modelName,
          field: fieldName,
        })

        this.props.close()

        // getting-started onboarding steps
        const isStep3 = this.context.gettingStartedState.isActive('STEP3_CREATE_TEXT_FIELD')
        if (isStep3 && fieldName === 'text' && typeIdentifier === 'String') {
          this.context.gettingStartedState.nextStep()
        }

        const isStep4 = this.context.gettingStartedState.isActive('STEP4_CREATE_COMPLETED_FIELD')
        if (isStep4 && fieldName === 'complete' && typeIdentifier === 'Boolean') {
          this.context.gettingStartedState.nextStep()
        }
      },
      onFailure: (transaction) => {
        alert(transaction.getError())
      },
    })
  }

  _isValid () {
    return this.state.fieldName !== ''
  }

  render () {
    // const { field } = this.props
    if (this.state.loading) {
      return (
        <div className={classes.background}>
          <Loading type='bubbles' delay={0} color='#fff' />
        </div>
      )
    }

    return (
      <div className={classes.background}>
        <div className={classes.container} onKeyUp={(e) => e.keyCode === 27 ? this.props.close() : null}>
          <div className={classes.head}>
            <div className={classes.title}>
              Create a new field
            </div>
            <div className={classes.subtitle}>
              You can change this field later
            </div>
          </div>
          <div className={classes.body}>
            <div className={classes.row}>
              <div className={classes.left}>
                Choose a name for your field
                <Icon
                  width={20}
                  height={20}
                  src={require('assets/icons/info.svg')}
                />
              </div>
              <div className={classes.right}>
                <input
                  autoFocus
                  type='text'
                  placeholder='Fieldname'
                  defaultValue={this.state.fieldName}
                  onChange={(e) => this.setState({ fieldName: e.target.value })}
                  onKeyUp={(e) => e.keyCode === 13 ? this._submit() : null}
                />
              </div>
            </div>
            <div className={classes.row}>
              <div className={classes.left}>
                Select the type of data
                <Icon
                  width={20}
                  height={20}
                  src={require('assets/icons/info.svg')}
                />
              </div>
              <div className={classes.right}>
                <TypeSelection
                  selected={this.state.typeIdentifier}
                  modelNames={this.props.allModels.map((m) => m.name)}
                  select={(typeIdentifier) => this.setState({ typeIdentifier })}
                />
              </div>
            </div>
            <div className={classes.rowBlock}>
              <div className={classes.row}>
                <div className={classes.left}>
                  Is this field required?
                  <Icon
                    width={20}
                    height={20}
                    src={require('assets/icons/info.svg')}
                  />
                </div>
                <div className={classes.right}>
                  <label>
                    <input
                      type='checkbox'
                      defaultChecked={this.state.isRequired}
                      onChange={(e) => this.setState({ isRequired: e.target.value })}
                      onKeyUp={(e) => e.keyCode === 13 ? this._submit() : null}
                    />
                    Required
                  </label>
                </div>
              </div>
              <div className={classes.row}>
                <div className={classes.left}>
                  Store multiple values
                  <Icon
                    width={20}
                    height={20}
                    src={require('assets/icons/info.svg')}
                  />
                </div>
                <div className={classes.right}>
                  <label>
                    <input
                      type='checkbox'
                      defaultChecked={this.state.isList}
                      onChange={(e) => this.setState({ isList: e.target.value })}
                      onKeyUp={(e) => e.keyCode === 13 ? this._submit() : null}
                    />
                    List
                  </label>
                </div>
              </div>
            </div>
          </div>
          <div className={classes.foot}>
            <div className={classes.button} onClick={this.props.close}>
              Cancel
            </div>
            <button
              className={`${classes.button} ${this._isValid() ? classes.green : classes.disabled}`}
              onClick={::this._submit}
            >
              Create Field
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default Relay.createContainer(FieldPopup, {
  fragments: {
    field: () => Relay.QL`
      fragment on Field {
        id
        fieldName
        typeIdentifier
        isRequired
        isList
        enumValues
        defaultValue
      }
    `,
  },
})