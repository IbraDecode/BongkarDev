import http from 'http';
import express, { Request, Response } from 'express';
import { request } from 'undici';
import WebSocket, { WebSocketServer } from 'ws';

interface ChromeTarget {
  id: string;
  title: string;
  type: string;
  url: string;
  webSocketDebuggerUrl?: string;
}

interface ClientMessageConnect {
  action: 'connect';
  targetId: string;
}

interface ClientMessageSend {
  action: 'send';
  targetId: string;
  payload: unknown;
}

interface ClientMessageDisconnect {
  action: 'disconnect';
  targetId: string;
}

interface ClientMessageList {
  action: 'list';
}

type ClientMessage =
  | ClientMessageConnect
  | ClientMessageSend
  | ClientMessageDisconnect
  | ClientMessageList;

type ClientMap = Map<string, WebSocket>;

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
const CDP_BASE = process.env.CDP_BASE ?? 'http://127.0.0.1:9222';

async function fetchTargets(): Promise<ChromeTarget[]> {
  const { body, statusCode } = await request(`${CDP_BASE}/json`);

  if (statusCode >= 400) {
    throw new Error(`Gagal mengambil target CDP: status ${statusCode}`);
  }

  return body.json() as Promise<ChromeTarget[]>;
}

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/json', async (_req: Request, res: Response) => {
  try {
    const targets = await fetchTargets();
    res.json(targets);
  } catch (error) {
    const err = error as Error;
    res.status(502).json({ message: 'Gagal mengambil daftar target', detail: err.message });
  }
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: '/ws' });

const clientConnections = new Map<WebSocket, ClientMap>();

function getClientTargets(client: WebSocket): ClientMap {
  let map = clientConnections.get(client);
  if (!map) {
    map = new Map();
    clientConnections.set(client, map);
  }
  return map;
}

async function handleConnect(client: WebSocket, targetId: string) {
  const targets = await fetchTargets();
  const target = targets.find((t) => t.id === targetId);

  if (!target || !target.webSocketDebuggerUrl) {
    throw new Error('Target tidak ditemukan atau tidak memiliki WebSocket debugger URL');
  }

  const cdpSocket = new WebSocket(target.webSocketDebuggerUrl);
  const clientTargets = getClientTargets(client);

  cdpSocket.on('open', () => {
    clientTargets.set(targetId, cdpSocket);
    client.send(
      JSON.stringify({
        type: 'connected',
        targetId,
      }),
    );
  });

  cdpSocket.on('message', (data) => {
    client.send(
      JSON.stringify({
        type: 'cdp-event',
        targetId,
        payload: data.toString(),
      }),
    );
  });

  cdpSocket.on('close', () => {
    clientTargets.delete(targetId);
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'disconnected',
          targetId,
        }),
      );
    }
  });

  cdpSocket.on('error', (error) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(
        JSON.stringify({
          type: 'error',
          targetId,
          message: (error as Error).message,
        }),
      );
    }
  });
}

function handleSend(client: WebSocket, targetId: string, payload: unknown) {
  const clientTargets = getClientTargets(client);
  const cdpSocket = clientTargets.get(targetId);

  if (!cdpSocket || cdpSocket.readyState !== WebSocket.OPEN) {
    throw new Error('Belum terhubung ke target');
  }

  const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
  cdpSocket.send(message);
}

function handleDisconnect(client: WebSocket, targetId: string) {
  const clientTargets = getClientTargets(client);
  const cdpSocket = clientTargets.get(targetId);

  if (cdpSocket) {
    cdpSocket.close();
    clientTargets.delete(targetId);
  }
}

wss.on('connection', (socket) => {
  socket.on('message', async (raw) => {
    try {
      const parsed = JSON.parse(raw.toString()) as ClientMessage;
      switch (parsed.action) {
        case 'list': {
          const targets = await fetchTargets();
          socket.send(
            JSON.stringify({
              type: 'targets',
              data: targets,
            }),
          );
          break;
        }
        case 'connect':
          await handleConnect(socket, parsed.targetId);
          break;
        case 'send':
          handleSend(socket, parsed.targetId, parsed.payload);
          break;
        case 'disconnect':
          handleDisconnect(socket, parsed.targetId);
          break;
        default:
          socket.send(
            JSON.stringify({
              type: 'error',
              message: 'Perintah tidak dikenal',
            }),
          );
      }
    } catch (error) {
      socket.send(
        JSON.stringify({
          type: 'error',
          message: (error as Error).message,
        }),
      );
    }
  });

  socket.on('close', () => {
    const targets = clientConnections.get(socket);
    targets?.forEach((cdpSocket) => cdpSocket.close());
    clientConnections.delete(socket);
  });
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`CDP proxy listening on http://localhost:${PORT}`);
});
