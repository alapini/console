import * as React from 'react'

interface Props {
  params: any
  selectedIndexIndex: number
  onSelectIndex: (i: number) => void
  indexes: any[]
}

export default class AlgoliaIndexes extends React.Component<Props, {}> {
  render() {
    const { indexes, selectedIndexIndex, onSelectIndex } = this.props

    return (
      <div>
        {indexes.map((index, i) =>
          <div
            className={
              'algolia-index' + (i === selectedIndexIndex ? ' active' : '')
            }
            key={index.id}
            onClick={() => onSelectIndex(i)}
          >
            <style jsx>{`
              .algolia-index {
                @p: .ph38, .pv25, .bb, .bBlack10, .flex, .itemsCenter, .relative,
                  .overflowHidden, .pointer;
              }
              .algolia-index.active {
                @p: .bgBlack04;
                &:after {
                  @p: .absolute, .bgDarkBlue;
                  content: "";
                  width: 15px;
                  height: 15px;
                  transform: rotate(45deg);
                  right: -8px;
                }
              }
              .index-name {
                @p: .black80, .f20, .fw3;
              }
              .model {
                @p: .fw6, .f14, .black80, .bgBlack07, .br2, .ml16;
                padding: 2px 5px 3px 6px;
              }
            `}</style>
            <div className="index-name">
              {index.indexName}
            </div>
            <div className="model">
              {index.model.name}
            </div>
          </div>,
        )}
      </div>
    )
  }
}
