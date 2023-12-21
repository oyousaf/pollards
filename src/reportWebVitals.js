import { getCLS, getFID, getLCP, getFCP, getTTFB } from 'web-vitals';

const sendToAnalytics = ({ id, name, value }) => {
  window.gtag('event', name, {
    event_category: 'Web Vitals',
    event_label: id,
    value: Math.round(value * 1000),
    non_interaction: true,
  });
};

export function reportWebVitals(onPerfEntry) {
  if (onPerfEntry && onPerfEntry instanceof Function) {
    getCLS(onPerfEntry);
    getFID(onPerfEntry);
    getLCP(onPerfEntry);
    getFCP(onPerfEntry);
    getTTFB(onPerfEntry);
  }
}
