import { create } from 'zustand';

export interface ChromeTarget {
  id: string;
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl?: string;
}

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error';

interface ConnectionStore {
  status: ConnectionStatus;
  error?: string;
  targets: ChromeTarget[];
  activeTargetId?: string;
  proxyHttpUrl: string;
  proxyWsUrl: string;
  refreshTargets: () => Promise<void>;
  connect: (targetId: string) => void;
  disconnect: () => void;
}

const socketRef: { current?: WebSocket } = {};

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  status: 'idle',
  targets: [],
  proxyHttpUrl: process.env.NEXT_PUBLIC_PROXY_HTTP ?? 'http://localhost:4000',
  proxyWsUrl: process.env.NEXT_PUBLIC_PROXY_WS ?? 'ws://localhost:4000/ws',
  refreshTargets: async () => {
    const { proxyHttpUrl } = get();
    const response = await fetch(`${proxyHttpUrl}/json`);
    if (!response.ok) {
      const message = `Gagal memuat target: ${response.status}`;
      set({ error: message, status: 'error' });
      return;
    }
    const data = (await response.json()) as ChromeTarget[];
    set({ targets: data, status: 'idle', error: undefined });
  },
  connect: (targetId: string) => {
    const { proxyWsUrl } = get();
    if (socketRef.current) {
      socketRef.current.close();
    }

    const socket = new WebSocket(proxyWsUrl);
    socketRef.current = socket;
    set({ status: 'connecting', error: undefined, activeTargetId: targetId });

    socket.onopen = () => {
      socket.send(
        JSON.stringify({
          action: 'connect',
          targetId,
        }),
      );
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data as string);
        if (payload.type === 'connected') {
          set({ status: 'connected', activeTargetId: payload.targetId });
        }
        if (payload.type === 'disconnected') {
          set({ status: 'idle', activeTargetId: undefined });
        }
        if (payload.type === 'error') {
          set({ status: 'error', error: payload.message });
        }
        if (payload.type === 'targets') {
          set({ targets: payload.data as ChromeTarget[] });
        }
      } catch (error) {
        set({ status: 'error', error: (error as Error).message });
      }
    };

    socket.onerror = () => {
      set({ status: 'error', error: 'Koneksi WebSocket gagal' });
    };

    socket.onclose = () => {
      set({ status: 'idle', activeTargetId: undefined });
    };
  },
  disconnect: () => {
    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = undefined;
    }
    set({ status: 'idle', activeTargetId: undefined });
  },
}));
