import { createContext, useContext, useEffect, useReducer } from 'react';
import { api, tokenStore } from './api';

/*
 * One WebSocket per session feeds a shared store of drones and alerts.
 * Pages read from this store instead of polling or opening their own sockets.
 */

const LiveContext = createContext(null);

const MAX_ALERTS = 100;
const MAX_DETECTIONS = 20;

const initial = {
  connected: false,
  drones: {}, // id -> drone
  alerts: [], // newest first
  detections: [], // newest first, live feed only
};

function upsertById(list, item, max) {
  const rest = list.filter((x) => x.id !== item.id);
  return [item, ...rest].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, max);
}

function reducer(state, action) {
  switch (action.type) {
    case 'connected':
      return { ...state, connected: action.value };
    case 'snapshot':
      return {
        ...state,
        drones: Object.fromEntries(action.drones.map((d) => [d.id, d])),
        alerts: action.alerts,
      };
    case 'drone':
      return { ...state, drones: { ...state.drones, [action.payload.id]: action.payload } };
    case 'drone_removed': {
      const drones = { ...state.drones };
      delete drones[action.payload.id];
      return { ...state, drones };
    }
    case 'telemetry': {
      const drones = { ...state.drones };
      for (const { droneId, updatedAt, ...t } of action.payload) {
        const d = drones[droneId];
        if (!d) continue;
        drones[droneId] = {
          ...d,
          status: d.status === 'offline' ? 'idle' : d.status,
          lastSeenAt: updatedAt,
          telemetry: { ...d.telemetry, ...t, updatedAt },
        };
      }
      return { ...state, drones };
    }
    case 'alert':
      return { ...state, alerts: upsertById(state.alerts, action.payload, MAX_ALERTS) };
    case 'detection':
      return { ...state, detections: upsertById(state.detections, action.payload, MAX_DETECTIONS) };
    default:
      return state;
  }
}

export function LiveProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);

  useEffect(() => {
    let ws;
    let retry;
    let attempt = 0;
    let stopped = false;
    let reconnecting = false;

    // Full state on load, and again after a reconnect so nothing missed while offline is lost
    const loadSnapshot = async () => {
      const [{ drones }, { alerts }] = await Promise.all([api('/drones'), api('/alerts?limit=100')]);
      if (!stopped) dispatch({ type: 'snapshot', drones, alerts });
    };

    const connect = () => {
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(`${proto}://${location.host}/ws`);
      ws.onopen = () => ws.send(JSON.stringify({ type: 'auth', token: tokenStore.get() }));
      ws.onmessage = (e) => {
        let msg;
        try {
          msg = JSON.parse(e.data);
        } catch {
          return;
        }
        if (msg.type === 'ready') {
          dispatch({ type: 'connected', value: true });
          if (reconnecting) loadSnapshot().catch(() => {});
          attempt = 0;
          reconnecting = false;
        } else {
          dispatch(msg);
        }
      };
      ws.onclose = (e) => {
        dispatch({ type: 'connected', value: false });
        if (stopped || e.code === 4003) return; // token rejected: the API's 401 handling logs the user out
        reconnecting = true;
        attempt += 1;
        retry = setTimeout(connect, Math.min(30000, 1000 * 2 ** Math.min(attempt, 5)));
      };
    };

    loadSnapshot().catch(() => {});
    connect();
    return () => {
      stopped = true;
      clearTimeout(retry);
      ws?.close();
    };
  }, []);

  return <LiveContext.Provider value={{ ...state, dispatch }}>{children}</LiveContext.Provider>;
}

export const useLive = () => useContext(LiveContext);
