import './Table.less';

import React from 'react';

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
                style={col.width === undefined ? { flex: 1 } : { minWidth: col.width }}
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
            <div key={i} className='Table__row'>
              {
                props.columns.map(col => (
                  <div
                    key={col.key}
                    className='Table__cell'
                    style={col.width === undefined ? { flex: 1 } : { minWidth: col.width }}
                  >
                    {item[col.key] ?? '-'}
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