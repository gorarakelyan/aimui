import React, { useState, useRef, useEffect } from 'react';
import UI from '../../../../../../../ui';
import PropTypes from 'prop-types';
import { classNames } from '../../../../../../../utils';

function ControlsSidebarXAlignment(props) {
  let [opened, setOpened] = useState(false);

  let popupRef = useRef();

  const { xAlignment, changeXAlignment } = props;

  useEffect(() => {
    if (opened && popupRef.current) {
      popupRef.current.focus();
    }
  }, [opened])

  return (
    <div className='ControlsSidebar__item__wrapper'>
      <div
        className={classNames({
          ControlsSidebar__item: true,
          active: opened,
          column: true,
        })}
        onClick={evt => setOpened(!opened)}
        title='Select X axes alignment'
      >
        <UI.Text small italic>X</UI.Text>
        <UI.Icon i='arrow_right_alt' scale={1.4} />
      </div>
      {opened && (
        <div
          className='ControlsSidebar__item__popup list'
          tabIndex={0}
          ref={popupRef}
          onBlur={evt => {
            const currentTarget = evt.currentTarget;
            if (opened) {
              window.setTimeout(() => {
                if (!currentTarget.contains(document.activeElement)) {
                  setOpened(false);
                }
              }, 200);
            }
          }}
        >
          <div className='ControlsSidebar__item__popup__header'>
            <UI.Text overline bold>Select X axes alignment</UI.Text>
          </div>
          <div className='ControlsSidebar__item__popup__list'>
            {
              ['step', 'epoch'].map(type => (
                <div
                  key={type}
                  className={classNames({
                    ControlsSidebar__item__popup__list__item: true,
                    active: xAlignment === type
                  })}
                  onClick={() => changeXAlignment(type)}
                >
                  {type.replace('_', ' ')}
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}

ControlsSidebarXAlignment.propTypes = {
  xAlignment: PropTypes.string,
  changeXAlignment: PropTypes.func,
};

export default ControlsSidebarXAlignment;