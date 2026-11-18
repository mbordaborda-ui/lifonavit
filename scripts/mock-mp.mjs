import { createServer } from "node:http";

const PORT = 4001;
let lastTotal = 0;
let externalReference = null;
let paymentStatus = "approved";
let paymentId = 910001;

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);

  const send = (status, body, type = "application/json") => {
    res.writeHead(status, { "Content-Type": type });
    res.end(typeof body === "string" ? body : JSON.stringify(body));
  };

  if (req.method === "POST" && url.pathname === "/checkout/preferences") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(raw);
        lastTotal = body?.items?.[0]?.unit_price ?? 0;
        externalReference = body?.external_reference ?? null;
        console.log("[mock-mp] preference", { lastTotal, externalReference });
        send(200, {
          id: `pref_${Date.now()}`,
          init_point: `http://localhost:${PORT}/checkout?pref=1`,
          sandbox_init_point: `http://localhost:${PORT}/checkout?pref=1`,
        });
      } catch {
        send(400, { message: "invalid body" });
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/checkout") {
    send(
      200,
      "<!doctype html><html><body style='font-family:sans-serif;padding:40px'><h1>Mercado Pago (simulado)</h1><p>Preferencia creada correctamente.</p></body></html>",
      "text/html",
    );
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/v1/payments/search")) {
    send(200, {
      results: externalReference
        ? [
            {
              id: paymentId,
              status: paymentStatus,
              status_detail: paymentStatus === "approved" ? "accredited" : "rejected",
              payment_method_id: "visa",
              transaction_amount: lastTotal,
              external_reference: externalReference,
            },
          ]
        : [],
    });
    return;
  }

  if (req.method === "GET" && url.pathname.startsWith("/v1/payments/")) {
    const id = Number(url.pathname.split("/").pop());
    send(200, {
      id,
      status: paymentStatus,
      status_detail: paymentStatus === "approved" ? "accredited" : "rejected",
      payment_method_id: "visa",
      transaction_amount: lastTotal,
      external_reference: externalReference,
    });
    return;
  }

  if (req.method === "POST" && url.pathname === "/__control") {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      try {
        const body = JSON.parse(raw);
        if (body.status) paymentStatus = body.status;
        if (body.paymentId) paymentId = body.paymentId;
        if (body.externalReference) externalReference = body.externalReference;
        if (typeof body.total === "number") lastTotal = body.total;
        send(200, { ok: true, paymentStatus, paymentId, externalReference, lastTotal });
      } catch {
        send(400, { ok: false });
      }
    });
    return;
  }

  if (req.method === "GET" && url.pathname === "/__state") {
    send(200, { paymentStatus, paymentId, externalReference, lastTotal });
    return;
  }

  send(404, { message: "not found" });
});

server.listen(PORT, () => {
  console.log(`[mock-mp] escuchando en http://localhost:${PORT}`);
});
