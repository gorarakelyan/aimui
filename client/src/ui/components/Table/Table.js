import './Table.less';

import React from 'react';
import { classNames } from '../../../utils';

function Table(props) {
  return (
    <table className='Table' cellSpacing={0} cellPadding={0}>
      {props.children}
    </table>
  );
}

export function TableNew(props) {
  return (
    <div className='Table'>
      <div className='Table__header'>
        <div className='Table__row Table__row--header'>
          {
            props.columns.map(col => (
              <div
                key={col.key}
                className='Table__cell Table__cell--header'
                style={{
                  minWidth: col.width,
                  ...col.stick && {
                    position: 'sticky',
                    [col.stick]: 0,
                    zIndex: 3
                  }
                }}
              >
                {col.content}
              </div>
            ))
          }
        </div>
      </div>
      <div className='Table__body'>
        {
          props.data.map((item, i) => (
            <div key={i} className='Table__row' {...item.props}>
              {
                props.columns.map(col => (
                  <div
                    key={col.key}
                    className={classNames({
                      Table__cell: true,
                      [`${typeof item[col.key] === 'object' && item[col.key].className}`]: true
                    })}
                    style={{
                      minWidth: col.width,
                      cursor: typeof item[col.key] === 'object' && item[col.key].onClick ? 'pointer' : 'auto',
                      ...col.stick && {
                        position: 'sticky',
                        [col.stick]: 0,
                        zIndex: 1
                      },
                      ...typeof item[col.key] === 'object' && item[col.key].hasOwnProperty('style') && item[col.key].style
                    }}
                    onClick={typeof item[col.key] === 'object' && item[col.key].onClick}
                  >
                    {typeof item[col.key] === 'object' && item[col.key].hasOwnProperty('content') ? (
                      item[col.key].content
                    ) : item[col.key] ?? '-'}
                  </div>
                ))
              }
            </div>
          ))
        }
      </div>
    </div>
  );
}

export default Table;