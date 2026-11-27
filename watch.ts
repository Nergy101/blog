#!/usr/bin/env -S deno run --allow-read --allow-write --allow-run --allow-net
import { build } from "astrodon";

let serverProcess: Deno.ChildProcess | null = null;
let isBuilding = false;

async function startServer() {
  if (serverProcess) {
    serverProcess.kill();
  }
  
  console.log("🚀 Starting server...");
  serverProcess = new Deno.Command("deno", {
    args: ["run", "--allow-read", "--allow-net", "--allow-run", "serve.ts"],
    cwd: Deno.cwd(),
    stdout: "inherit",
    stderr: "inherit",
  }).spawn();
}

async function rebuild() {
  if (isBuilding) {
    console.log("⏳ Build already in progress, skipping...");
    return;
  }
  
  isBuilding = true;
  console.log("🔨 Building...");
  
  try {
    await build({
      contentDir: new URL("./routes", import.meta.url).pathname,
      outDir: new URL("./dist", import.meta.url).pathname,
      assetsDir: new URL("./assets", import.meta.url).pathname,
      componentsDir: new URL("./components", import.meta.url).pathname,
      siteTitle: "Nergy",
      brandName: "Nergy's Blog",
      siteUrl: "https://blog.nergy.space",
    });
    
    console.log("✅ Build completed successfully");
    await startServer();
  } catch (error) {
    console.error("❌ Build failed:", error);
  } finally {
    isBuilding = false;
  }
}

async function watchFiles() {
  console.log("👀 Watching for file changes...");
  
  // Watch for changes in routes, assets, and components directories
  const watcher = Deno.watchFs([
    "./routes",
    "./assets", 
    "./components",
    "./build.ts",
    "./serve.ts"
  ]);
  
  // Initial build and serve
  await rebuild();
  
  for await (const event of watcher) {
    if (event.kind === "modify" || event.kind === "create" || event.kind === "remove") {
      console.log(`📝 File changed: ${event.paths.join(", ")}`);
      await rebuild();
    }
  }
}

// Handle cleanup on exit
Deno.addSignalListener("SIGINT", () => {
  console.log("\n🛑 Stopping watch mode...");
  if (serverProcess) {
    serverProcess.kill();
  }
  Deno.exit(0);
});

// Start watching
await watchFiles();

