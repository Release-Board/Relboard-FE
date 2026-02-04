import ReactGA from "react-ga4";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
let initialized = false;

export const initGA = () => {
  if (!GA_ID) return;
  if (initialized) return;
  ReactGA.initialize(GA_ID);
  initialized = true;
};

export const trackPageView = (path: string) => {
  if (!GA_ID) return;
  ReactGA.send({ hitType: "pageview", page: path });
};

type GAEventParams = Record<string, string | number | boolean | undefined>;

export const trackEvent = (action: string, params: GAEventParams = {}) => {
  if (!GA_ID) return;
  ReactGA.event(action, params);
};
