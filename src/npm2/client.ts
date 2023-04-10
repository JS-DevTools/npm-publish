export interface NpmClient {
  getVersions(packageName: string): Promise<GetVersionsResult>;
  cleanup(): Promise<void>;
}

export interface NpmClientOptions {
  registry: string;
  token: string;
}

export interface GetVersionsResult {
  "dist-tags": Record<string, string>;
  versions: string[];
}
