// router.js — tiny hash-router primitives shared between App + pages
import React from 'react';

export function navigate(path) {
  window.location.hash = path;
  window.scrollTo({ top: 0 });
}

export function useHashRoute() {
  const parse = () => {
    const raw = window.location.hash.replace(/^#/, '') || '/shop';
    const [path] = raw.split('?');
    return { path, raw };
  };
  const [route, setRoute] = React.useState(parse);
  React.useEffect(() => {
    const onChange = () => setRoute(parse());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return route;
}
