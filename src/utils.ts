import { BridgeClientCredentials } from "./hue.types";
import { access, readFile, writeFile, removeFile } from "./filesystem";

const BridgeClientCredentialsPath = "./client.json";

export const persistNewCredentials = async (data: BridgeClientCredentials) => {
  try {
    await writeFile(BridgeClientCredentialsPath, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
};

export const getRegisteredCredentials =
  async (): Promise<BridgeClientCredentials> => {
    try {
      await access(BridgeClientCredentialsPath);

      const clientData = await readFile(BridgeClientCredentialsPath, {
        encoding: "utf8",
      });

      return JSON.parse(clientData) as BridgeClientCredentials;
    } catch {
      return null;
    }
  };

export const clearPersistedCredentials = async () => {
  try {
    await access(BridgeClientCredentialsPath);
    await removeFile(BridgeClientCredentialsPath, {});
  } catch {}
};

export const sleep = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));
