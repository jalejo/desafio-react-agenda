const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();

const PORT = 9000;

server.use(middlewares);
server.use("/api", router);
server.listen(PORT, () => {
  console.log(`JSON Server is running in http://localhost:${PORT}`);
});
