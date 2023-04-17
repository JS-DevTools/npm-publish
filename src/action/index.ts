import { setFailed } from "@actions/core";
import { run } from "./run.js";

run().catch((error: Error) => setFailed(error));
