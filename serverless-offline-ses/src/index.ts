import { ChildProcess, spawn } from "child_process";
import { join } from "path";
import { existsSync } from "fs";
import Serverless from "serverless";
import { ServerlessPluginCommand } from "../types/serverless-plugin-command";

let NODE_MODULES_PATH = join(process.cwd(), "./node_modules/.bin");
if (!existsSync(join(NODE_MODULES_PATH, "aws-ses-local"))) {
  NODE_MODULES_PATH = join(__dirname, "..", "./node_modules/.bin");
}

interface SeverlessOfflineSesLocalOptions {
  stages?: string[];
  port?: number | string | null;
  outputDir?: string | null;
  clean?: boolean | null;
}

class ServerlessOfflineSesPlugin {
  public readonly commands: Record<string, ServerlessPluginCommand>;
  public readonly hooks: Record<string, () => Promise<any>>;
  private SeverlessOfflineSesConfig: SeverlessOfflineSesLocalOptions;
  private sesInstances: Record<string, ChildProcess> = {};

  public constructor(private serverless: Serverless) {
    this.commands = {};

    this.SeverlessOfflineSesConfig = this.serverless.service?.custom?.ses || {};

    this.hooks = {
      "before:offline:start:end": this.stopSes,
      "before:offline:start:init": this.startSes,
    };
  }

  private spawnSesProcess = async (
    options: SeverlessOfflineSesLocalOptions,
  ) => {
    const outputDir = options.outputDir ? options.outputDir : "./output";
    const port = options.port ? options.port.toString() : "9001";
    const clean = options.clean ? true : false;
    const args = [`${NODE_MODULES_PATH}/aws-ses-local`];

    args.push(`--port`);
    args.push(port);
    if (clean) {
      args.push(`-c`);
    }
    if (outputDir) {
      args.push(`--outputDir`);
      args.push(outputDir);
    }

    this.serverless.cli.log(
      `serverless-offline-ses - Starting ses with command ${args.join(" ")}`,
    );
    const proc = spawn("/bin/sh", ["-c", args.join(" ")]);

    const pause = async (duration: number) =>
      new Promise((r) => setTimeout(r, duration));
    await pause(1000);
    proc.stdout.on("data", (data) => {
      this.serverless.cli.log(`serverless-offline-ses: ${data.toString()}`);
    });
    proc.stderr.on("data", (data) => {
      this.serverless.cli.log(`serverless-offline-ses: ${data.toString()}`);
    });
    proc.on("error", (error) => {
      this.serverless.cli.log(
        `serverless-offline-ses error: ${error.toString()}`,
      );
      throw error;
    });
    proc.on("close", (code) => {
      this.serverless.cli.log(
        `serverless-offline-ses process exited with code ${code}`,
      );

      if (code !== 0) {
        this.serverless.cli.log(
          `serverless-offline-ses process exited with code ${code}`,
        );
      }
    });

    if (proc.pid == null || (proc.exitCode && proc.exitCode !== 0)) {
      this.serverless.cli.log(
        `serverless-offline-ses process failed to start with code ${proc.exitCode}`,
      );

      throw new Error("Unable to start the serverless-offline-ses process");
    }

    this.sesInstances[port] = proc;

    (([
      "beforeExit",
      "exit",
      "SIGINT",
      "SIGTERM",
      "SIGUSR1",
      "SIGUSR2",
      "uncaughtException",
    ] as unknown) as NodeJS.Signals[]).forEach((eventType) => {
      process.on(eventType, () => {
        this.killSesProcess(this.SeverlessOfflineSesConfig);
      });
    });

    return {
      proc,
      port,
    };
  };

  private killSesProcess = (options: SeverlessOfflineSesLocalOptions) => {
    const port = options.port ? options.port.toString() : 9001;

    if (this.sesInstances[port] != null) {
      this.sesInstances[port].kill("SIGKILL");
      delete this.sesInstances[port];
    }
  };

  private shouldExecute = () => {
    if (
      this.SeverlessOfflineSesConfig.stages &&
      this.SeverlessOfflineSesConfig.stages.includes(
        this.serverless.service.provider.stage,
      )
    ) {
      return true;
    }
    return false;
  };

  private startSes = async () => {
    if (!this.shouldExecute()) {
      this.serverless.cli.log(
        "serverless-offline-ses - non configured stage. Will not start.",
      );
      return;
    }

    const { port } = await this.spawnSesProcess(this.SeverlessOfflineSesConfig);

    this.serverless.cli.log(
      `serverless-offline-ses started - Listening on ${port}`,
    );

    await Promise.resolve();
  };

  private stopSes = async () => {
    this.killSesProcess(this.SeverlessOfflineSesConfig);
    this.serverless.cli.log("serverless-offline-ses - Stopped");
  };
}

export = ServerlessOfflineSesPlugin;
