Run instructions

Server

cd server
npm install
npm run dev

Client

cd client
npm install
npm run dev

The client proxies API calls to http://localhost:4000 via Vite config.

Notes

- The RA execution endpoint is POST /api/ra/execute and accepts structured JSON { tables: {...}, op: {...} }.
- To iterate quickly, run server in dev mode (nodemon) and client with Vite.
