import * as React from 'react'
import Icon from 'graphcool-styles/dist/components/Icon/Icon'
import {
  CellRequirements,
  getEditCell,
} from '../DatabrowserView/Cell/cellgenerator'
import { TypedValue } from '../../../types/utils'
import { Enum, Field } from '../../../types/types'
import { valueToString } from '../../../utils/valueparser'
import * as cn from 'classnames'

interface State {
  isEnteringValue: boolean
  isHoveringValue: boolean
}

interface Props {
  value: TypedValue
  onChangeValue: any
  projectId: string
  field: Field
  placeholder?: string
  optional: boolean
  enums: Enum[]
}

export default class EditValueInput extends React.Component<Props, State> {
  state = {
    isEnteringValue: false,
    isHoveringValue: false,
  }

  render() {
    const { isEnteringValue } = this.state
    const { value, placeholder, field, optional } = this.props

    return (
      <div className="container">
        <style jsx={true}>{`
          .container {
            @p: .bgWhite, .flex, .justifyCenter;
          }
          .edit-value {
            @p: .flex, .justifyCenter, .ph10;
            width: auto;
            height: auto;
            min-height: 52px;
          }
          .edit-value.entering {
            @p: .bBlue, .ba, .br2;
          }
          .edit-value.entering :global(input) {
            padding: 15px 20px;
          }
        `}</style>
        <style jsx global>{`
          .field-popup .edit-value input {
            background: none;
          }
          .field-popup .edit-value > div > div > div:nth-of-type(2) {
            border: none !important;
          }
          .field-popup .edit-value > div > div:nth-child(2) {
            left: -56px;
          }
        `}</style>
        {isEnteringValue
          ? <div className="relative">
              <div className={cn('edit-value', { entering: isEnteringValue })}>
                {this.getInput()}
              </div>
            </div>
          : typeof value === 'undefined'
            ? <div
                className="flex itemsCenter pointer bbox edit-value"
                onClick={() =>
                  this.setState(
                    {
                      isEnteringValue: true,
                    } as State,
                  )}
              >
                <Icon
                  src={require('../../../assets/icons/edit_circle_gray.svg')}
                  width={26}
                  height={26}
                />
                <div className="f16 black40 ml16">
                  {placeholder || 'add value'}
                  {optional && <span className="black30"> (optional)</span>}
                </div>
              </div>
            : <div
                className="flex itemsCenter pointer bbox edit-value "
                onMouseEnter={() =>
                  this.setState({ isHoveringValue: true } as State)}
                onMouseLeave={() =>
                  this.setState({ isHoveringValue: true } as State)}
                onClick={() =>
                  this.setState(
                    {
                      isEnteringValue: true,
                      isHoveringValue: false,
                    } as State,
                  )}
              >
                <div className="f16 black50 pr6">
                  {valueToString(value, field, true)}
                </div>
                {this.state.isHoveringValue &&
                  <Icon
                    className="ml6"
                    src={require('../../../assets/icons/edit_project_name.svg')}
                    width={20}
                    height={20}
                  />}
              </div>}
      </div>
    )
  }

  private getInput() {
    let value: any = this.props.value
    if (this.props.field.isList) {
      if (typeof this.props.value === 'undefined') {
        value = []
      } else if (!Array.isArray(this.props.value)) {
        value = [this.props.value]
      }
    }

    const requirements: CellRequirements = {
      value,
      field: {
        ...this.props.field,
        isRequired: !this.props.optional,
      },
      inList: true,
      projectId: this.props.projectId,
      methods: {
        save: savingValue => {
          this.setState({ isEnteringValue: false } as State)
          this.props.onChangeValue(savingValue)
        },
        cancel: () => {
          this.setState({ isEnteringValue: false } as State)
        },
        onKeyDown: (e: any) => {
          if (
            ['String'].includes(this.props.field.typeIdentifier) &&
            e.keyCode === 13
          ) {
            this.setState({ isEnteringValue: false } as State)
            this.props.onChangeValue(e.target.value)
          }
          // on key down...
        },
      },
      enums: this.props.enums,
    }

    return getEditCell(requirements)
  }
}
