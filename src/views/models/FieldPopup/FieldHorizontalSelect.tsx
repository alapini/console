import * as React from 'react'
import {$v} from 'graphcool-styles'
import * as cn from 'classnames'

interface Props {
  selectedIndex: number
  choices: string[]
  activeBackgroundColor: string
  onChange: (index: number, choice: string) => void
  inactiveBackgroundColor?: string
  inactiveTextColor?: string
  infos?: string[]
  small?: boolean
  readOnly?: boolean
  className?: string
}

export default class FieldHorizontalSelect extends React.Component<Props, {}> {

  render() {

    const {activeBackgroundColor, selectedIndex, onChange, choices, infos, small, readOnly, className} = this.props
    const inactiveTextColor = this.props.inactiveTextColor || $v.gray30
    const inactiveBackgroundColor = this.props.inactiveBackgroundColor || $v.gray04

    return (
      <div className={cn('container', {'none-selected': selectedIndex === -1, small, readOnly}, className)}>
        <style jsx>{`
          .container {
            @inherit: .flex, .itemsCenter, .justifyCenter, .mv38, .relative, .ph16, .w100, .bbox;
            height: 42px;
          }
          .container.small {
            @p: .ma0;
            height: 60px;
          }
          .container.readOnly {
            @p: .o70;
            pointer-events: none;
            cursor: not-drop;
          }

          .after-selection {
            @p: .absolute, .overflowHidden;
            content: "";
            left: 0px;
            top: -1px;
            height: 44px;
            width: 6px;
          }

          .container.small .after-selection {
            height: 36px;
          }

          .after-selection .bar {
            @p: .bgBlue, .br2, .relative;
            height: 44px;
            left: -4px;
            width: 10px;
          }

          .container.small .after-selection .bar {
            height: 36px;
          }

          .element {
            @inherit: .relative, .pointer, .br2, .f14, .fw6, .ttu, .nowrap, .z0;
            margin: 0 -2px;
            padding: 10px 16px;
          }

          .element.selected {
            @p: .z2;
            padding: 12px 18px;
          }

          .container.small .element {
            padding: 3px 8px;
          }

          .container.small .element.selected {
            padding: 4px 6px;
          }

          .additional-info {
            @p: .flex, .tc, .justifyCenter, .mt10, .black50;
          }
        `}</style>
        {choices.map((choice, i) => {
          return (
            <div className='flex flexColumn justifyCenter'>
              <div
                className={cn('element', {selected: selectedIndex === i})}
                key={i}
                onClick={() => onChange(i, choice)}
                style={{
                  backgroundColor: selectedIndex === i ? activeBackgroundColor : inactiveBackgroundColor,
                  color: selectedIndex === i ? 'white' : inactiveTextColor,
                }}
              >
                {choice}
              </div>
              {infos && infos[i] && (
                <div className='additional-info'>
                  {infos[i]}
                </div>
              )}
            </div>
          )
        })}
        {selectedIndex === -1 && (
          <div className='after-selection'>
            <div className='bar'></div>
          </div>
        )}
      </div>
    )
  }
}
