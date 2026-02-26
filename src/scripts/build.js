const { mkdir, cp } = require("node:fs/promises");
const { resolve } = require("node:path");
const { spawn } = require("node:child_process");

const scriptsDir = __dirname;
const projectRoot = resolve(scriptsDir, "..", "..");

function runTsc() {
    return new Promise((resolvePromise, rejectPromise) => {
        const command = process.platform === "win32" ? "npx.cmd" : "npx";
        const processHandle = spawn(command, ["tsc"], {
            cwd: projectRoot,
            stdio: "inherit",
        });

        processHandle.on("error", rejectPromise);
        processHandle.on("exit", (code) => {
            if (code === 0) {
                resolvePromise();
                return;
            }

            rejectPromise(new Error(`TypeScript compilation failed with exit code ${code}`));
        });
    });
}

async function copyDir(name) {
    const source = resolve(projectRoot, "src", name);
    const destination = resolve(projectRoot, "dist", name);

    await mkdir(destination, { recursive: true });
    await cp(source, destination, { recursive: true });
}

async function build() {
    await runTsc();
    await copyDir("pages");
    await copyDir("styles");
    console.log("Build completed: copied src/pages and src/styles to dist/");
}

build().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
});