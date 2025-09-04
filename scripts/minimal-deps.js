#!/usr/bin/env node

/**
 * minimal-deps.js - Creates a minimal node_modules with only specified dependencies using pnpm
 *
 * Usage: node minimal-deps.js [--dev] [--keep-backup] [--clean-lockfile] package1 package2 ...
 */

import { execSync } from "child_process";
import fs from "fs";
import path from "path";

// Parse command line arguments and set up configuration
const config = {
    isDev: process.argv.includes("--dev"),
    keepBackup: process.argv.includes("--keep-backup"),
    cleanLockfile: process.argv.includes("--clean-lockfile"),
    dependencies: process.argv.slice(2).filter((arg) => !arg.startsWith("--")),
};

// Exit if no dependencies specified
if (config.dependencies.length === 0) {
    console.error("Error: No dependencies specified.");
    console.log(
        "Usage: node minimal-deps.js [--dev] [--keep-backup] [--clean-lockfile] package1 package2 ...",
    );
    process.exit(1);
}

// Paths
const projectRoot = process.cwd();
const packageJsonPath = path.join(projectRoot, "package.json");
const backupPath = path.join(projectRoot, "package.json.bak");

// Check if package.json exists
if (!fs.existsSync(packageJsonPath)) {
    console.error("Error: package.json not found in current directory.");
    process.exit(1);
}

// Backup original package.json
try {
    fs.copyFileSync(packageJsonPath, backupPath);
    console.log(`Original package.json backed up to ${backupPath}`);
} catch (error) {
    console.error(
        "Error backing up package.json:",
        error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
}

// Create and install with minimal package.json
try {
    // Load original package.json
    const originalPackage = JSON.parse(
        fs.readFileSync(packageJsonPath, "utf-8"),
    );

    // Create minimal package.json
    const dependencyType = config.isDev ? "devDependencies" : "dependencies";
    const minimalPackage = {
        name: originalPackage.name,
        version: originalPackage.version || "1.0.0",
        private: true,
        [dependencyType]: {},
    };

    // Remove all scripts in the minimal package.json
    // (original will be restored after installation)

    // Preserve package manager settings and engines
    if (originalPackage.packageManager)
        minimalPackage.packageManager = originalPackage.packageManager;
    if (originalPackage.engines)
        minimalPackage.engines = originalPackage.engines;

    // Add requested dependencies
    for (const dep of config.dependencies) {
        const version =
            (originalPackage.dependencies &&
                originalPackage.dependencies[dep]) ||
            (originalPackage.devDependencies &&
                originalPackage.devDependencies[dep]) ||
            "latest";

        if (version === "latest") {
            console.warn(
                `Warning: Package '${dep}' not found in original package.json. Using 'latest'.`,
            );
        }

        minimalPackage[dependencyType][dep] = version;
    }

    // Write minimal package.json
    fs.writeFileSync(packageJsonPath, JSON.stringify(minimalPackage, null, 2));
    console.log(
        "Created minimal package.json with only specified dependencies",
    );

    // Handle lockfiles if requested
    if (config.cleanLockfile) {
        const lockfilePath = path.join(projectRoot, "pnpm-lock.yaml");
        if (fs.existsSync(lockfilePath)) {
            fs.renameSync(lockfilePath, `${lockfilePath}.bak`);
            console.log(`Renamed pnpm-lock.yaml to pnpm-lock.yaml.bak`);
        }
    }

    // Install dependencies using pnpm
    console.log("Installing dependencies using pnpm...");
    execSync("pnpm install --no-frozen-lockfile", {
        cwd: projectRoot,
        stdio: "inherit",
    });
    console.log("Installation completed successfully!");
} catch (error) {
    console.error(
        "Error:",
        error instanceof Error ? error.message : String(error),
    );
    console.log("Restoring original package.json...");

    // Restore lockfile if needed
    if (config.cleanLockfile) {
        const backupLockfile = path.join(projectRoot, "pnpm-lock.yaml.bak");
        if (fs.existsSync(backupLockfile)) {
            fs.renameSync(
                backupLockfile,
                path.join(projectRoot, "pnpm-lock.yaml"),
            );
        }
    }
} finally {
    // Always restore original package.json
    fs.copyFileSync(backupPath, packageJsonPath);
    console.log("Original package.json has been restored");

    // Remove backup if not keeping it
    if (!config.keepBackup) {
        fs.unlinkSync(backupPath);
    } else {
        console.log(`Backup kept at ${backupPath}`);
    }
}

console.log(
    "\nAll done! You now have a node_modules with only the specified dependencies.",
);
