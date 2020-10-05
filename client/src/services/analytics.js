import { isDev } from '../utils';
import { SEGMENT_WRITE_KEY, SEGMENT_DEMO_WRITE_KEY } from '../config';


const enabled = () => {
  return !isDev();//!isDev() && cookies.getCookie(configs.USER_ANALYTICS_COOKIE_NAME) == 1;
};

const init = () => {
  if (!enabled()) {
    return;
  }

  if (window.location.hostname.indexOf('demo') !== -1 && window.location.hostname.indexOf('aimstack.io') !== -1) {
    window.analytics.load(SEGMENT_DEMO_WRITE_KEY);
  } else {
    window.analytics.load(SEGMENT_WRITE_KEY);
  }
};

const pageView = (pageName, pageCat=null) => {
  if (!enabled()) {
    return;
  }

  window.analytics.page(pageCat, pageName, {
    path: window.location.pathname,
    url: window.location.hostname,
    search: null,
    referrer: null,
  });
};

/*
const trackEvent = (eventName, properties={}) => {
  if (!enabled()) {
    return;
  }

  window.analytics.track(eventName, properties);
};
 */

export {
  init,
  pageView,
  // trackEvent,
};