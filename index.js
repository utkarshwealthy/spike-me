var fastify = require("fastify")({ logger: true });
const crypto = require("crypto");

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function generateLoad(numOperations) {
  const promises = [];

  // Create an array of Promises to perform some computation
  for (let i = 0; i < numOperations; i++) {
    promises.push(
      new Promise((resolve) => {
        // Simulate CPU-heavy task with crypto operation
        crypto.pbkdf2("password", "salt", 100000, 64, "sha512", () => {
          resolve();
        });
      }),
    );
  }

  // Return a Promise that resolves when all operations are complete
  return Promise.all(promises);
}

/* GET home page. */
fastify.get("/", (_req, _res, _next) => ({ success: true }));

fastify.get("/definedLatency/:latency", async function (req, _res, _next) {
  const latency = req.params.latency;
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(parseInt(latency)); /// waiting 1 second.
  return { success: true, latency: latency };
});

fastify.get("/randomLatency", async function (_req, _res, _next) {
  const min = 200;
  const max = 5000;
  const rndInt = randomIntFromInterval(min, max);
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  await delay(parseInt(rndInt)); /// waiting 1 second.
  return { success: true, latency: rndInt };
});
fastify.get("/load/:load", async function (req, _res, _next) {
  generateLoad(parseInt(req.params.load)).then();
  return { success: true, load: req.params.load };
});

fastify.listen(3000, "0.0.0.0", function (err, _address) {
  if (err) {
    fastify.log.error(err);
    process.exit(1);
  }
});
