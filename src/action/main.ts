import { run } from "./run.js";
import { setFailed } from "./core.js";

run().catch((error: Error) => setFailed(error));
