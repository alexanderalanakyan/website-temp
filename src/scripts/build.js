const { exec } = require("node:child_process");
const fs = require("fs");
const path = require("path");
const { readdirSync } = require("node:fs");
const { extname } = require("node:path");
const ignoredPaths = ["404.html"];
const pages = [];
const srcDir = path.join(__dirname, "..");
const projectRoot = path.join(srcDir, "..");
const distDir = path.join(projectRoot, "dist");


function runTsc() {
  exec("npx tsc", { cwd: projectRoot }, (err) => {
    if (err) {
      console.error("tsc failed:", err.message);
      process.exit(1);
    } else {
      console.log(`✓ built typescript successfully`);
    }
  });
}

function copyDir() {
  try {
    fs.rmSync(distDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 });
  } catch (err) {
    console.log("Error:", err);
  }

  fs.readdirSync(srcDir).forEach((entry) => {
    if (entry === "www") {
      readdirSync(path.join(srcDir, entry)).forEach((fileName) => {
        if (!ignoredPaths.includes(fileName) && extname(fileName) === ".html") {
          pages.push(fileName);
        }
      });

      fs.rmSync(path.join(srcDir, "www", "pages.json"), { force: true });
      fs.writeFileSync(path.join(srcDir, "www", "pages.json"), JSON.stringify(pages));
    }

    if (entry !== "scripts") {
      const src = path.join(srcDir, entry);
      const dest = path.join(distDir, entry);
      fs.cpSync(src, dest, { recursive: true });
      console.log(`✓ copied ${entry}`);
    }
  });
}

function build() {
  copyDir();
  runTsc();
}

build();