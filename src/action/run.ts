import {
  npmPublish,
  type Access,
  type Strategy,
  type Options,
} from "../index.js";
import * as core from "./core.js";

/**
 * Run the action.
 */
export async function run(): Promise<void> {
  const options: Options = {
    token: core.getRequiredSecretInput("token"),
    registry: core.getInput("registry"),
    package: core.getInput("package"),
    tag: core.getInput("tag"),
    access: core.getInput<Access>("access"),
    strategy: core.getInput<Strategy>("strategy"),
    dryRun: core.getBooleanInput("dry-run"),
    logger: core.logger,
    temporaryDirectory: process.env["RUNNER_TEMP"],
  };

  const results = await npmPublish(options);

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
