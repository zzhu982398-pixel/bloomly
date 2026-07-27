import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("https://bloomly.test/", {
      headers: {
        accept: "text/html",
        host: "bloomly.test",
        "x-forwarded-host": "bloomly.test",
        "x-forwarded-proto": "https",
      },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders Bloomly's product experience and metadata", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /Bloomly/);
  assert.match(html, /Turn a feeling into/);
  assert.match(html, /Grow this feeling/);
  assert.match(html, /Your meadow/);
  assert.match(html, /https:\/\/bloomly\.test\/og\.png/);
  assert.doesNotMatch(html, /codex-preview|loading skeleton|Starter Project/i);
});

test("ships the social preview at the standard Open Graph size", async () => {
  const image = await readFile(new URL("../public/og.png", import.meta.url));
  assert.equal(image.subarray(1, 4).toString(), "PNG");

  const width = image.readUInt32BE(16);
  const height = image.readUInt32BE(20);
  assert.equal(width, 1200);
  assert.equal(height, 630);
});
