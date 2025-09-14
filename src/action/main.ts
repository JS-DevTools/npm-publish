/** Action entry point */
import { type Access, npmPublish, type Strategy } from "../index.js";
import * as core from "./core.js";

/** Run the action. */
async function run(): Promise<void> {
  const results = await npmPublish({
    token: core.getRequiredSecretInput("token"),
    registry: core.getInput("registry"),
    package: core.getInput("package"),
    tag: core.getInput("tag"),
    access: core.getInput("access") as Access | undefined,
    provenance: core.getBooleanInput("provenance"),
    strategy: core.getInput("strategy") as Strategy | undefined,
    ignoreScripts: core.getBooleanInput("ignore-scripts"),
    dryRun: core.getBooleanInput("dry-run"),
    logger: core.logger,
    temporaryDirectory: process.env.RUNNER_TEMP,
  });

  core.setOutput("id", results.id, "");
  core.setOutput("name", results.name);
  core.setOutput("version", results.version);
  core.setOutput("type", results.type, "");
  core.setOutput("old-version", results.oldVersion, "");
  core.setOutput("registry", results.registry.href);
  core.setOutput("tag", results.tag);
  core.setOutput("access", results.access, "default");
  core.setOutput("strategy", results.strategy);
  core.setOutput("dry-run", results.dryRun);
}

/** Main action entry point. */
export async function main(): Promise<void> {
  try {
    await run();
  } catch (error) {
    core.setFailed(error);
  }
}
