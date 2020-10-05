import './ControlsSidebar.less';

import React, { useContext } from 'react';
import HubMainScreenContext from '../../HubMainScreenContext/HubMainScreenContext';
import ControlsSidebarExport from './components/ControlsSidebarExport/ControlsSidebarExport';
import ControlsSidebarToggleOutliers from './components/ControlsSidebarToggleOutliers/ControlsSidebarToggleOutliers';
import GroupByColor from './components/GroupByColor/GroupByColor';
import GroupByStyle from './components/GroupByStyle/GroupByStyle';
import GroupByChart from './components/GroupByChart/GroupByChart';
import Aggregate from './components/Aggregate/Aggregate';
import UI from '../../../../../ui';
import ControlsSidebarXAlignment from './components/ControlsSidebarXAlginment/ControlsSidebarXAlignment';
import ControlsSidebarZoom from './components/ControlsSidebarZoom/ControlsSidebarZoom';
import ControlsSidebarToggleInterpolation from './components/ControlsSidebarToggleInterpolation/ControlsSidebarToggleInterpolation';
import SidebarMenu from './components/SidebarMenu/SidebarMenu';

function ControlsSidebar() {
  let { contextFilter, setContextFilter, runs, chart, setChartSettingsState } = useContext(HubMainScreenContext);

  const { groupByColor, groupByStyle, groupByChart, aggregated } = contextFilter;

  return (
    <div className='ControlsSidebar'>
      <SidebarMenu

      />
      <div className='ControlsSidebar__items'>
        <GroupByColor
          groupByColor={groupByColor}
          setContextFilter={setContextFilter}
        />
        <GroupByStyle
          groupByStyle={groupByStyle}
          setContextFilter={setContextFilter}
        />
        <GroupByChart
          groupByChart={groupByChart}
          setContextFilter={setContextFilter}
        />
        <Aggregate
          aggregated={aggregated}
          setContextFilter={setContextFilter}
          disabled={groupByColor.length === 0 && groupByStyle.length === 0 && groupByChart.length === 0}
        />
        <UI.Line />
        <ControlsSidebarToggleOutliers
          disabled={runs.isLoading || runs.isEmpty}
          settings={chart.settings}
          setChartSettingsState={setChartSettingsState}
        />
        <ControlsSidebarToggleInterpolation
          disabled={runs.isLoading || runs.isEmpty}
          settings={chart.settings}
          setChartSettingsState={setChartSettingsState}
        />
        <ControlsSidebarXAlignment
          settings={chart.settings}
          setChartSettingsState={setChartSettingsState}
        />
        <UI.Line />
        <ControlsSidebarZoom
          settings={chart.settings}
          setChartSettingsState={setChartSettingsState}
        />
        {/* <ControlsSidebarExport 
          disabled={runs.isLoading || runs.isEmpty} 
        /> */}
      </div>
    </div>
  );
}

ControlsSidebar.propTypes = {};

export default ControlsSidebar;