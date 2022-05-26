import * as https from "https";
import { dtls } from "node-dtls-client";

import {
  Room,
  Zone,
  Light,
  Scene,
  Device,
  BridgeHome,
  ResourceNode,
  BridgeConfig,
  EntertainmentArea,
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
  LightGroup,
} from "./hue.types";

interface HueBridgeArgs {
  url: string;
  credentials: BridgeClientCredentials;
}

type JSONResponse<T extends {}> = {
  errors?: Error[];
  data: T;
};

export default class HueBridge {
  static async discover(): Promise<HueBridgeNetworkDevice[]> {
    const response = await fetch("https://discovery.meethue.com/");

    return response.json();
  }

  static async getInfo(url: string): Promise<BridgeConfig> {
    const response = await fetch(`http://${url}/api/config`);

    return response.json();
  }

  static async register(
    url: string,
    devicetype: string = "hue-sync"
  ): Promise<BridgeClientCredentials> {
    const endpoint = `http://${url}/api`;
    const body = JSON.stringify({
      devicetype,
      generateclientkey: true,
    });

    const response = await fetch(endpoint, {
      body,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    type CredentialsResponse = {
      error: Error[];
      success: BridgeClientCredentials;
    };

    const [{ error, success }]: CredentialsResponse[] = await response.json();

    if (error) throw error;

    return success;
  }

  // properties
  private url: string = null;
  private socket: dtls.Socket = null;
  private entertainmentArea: EntertainmentArea = null;
  private credentials: BridgeClientCredentials = null;
  private abortionController: AbortController = new AbortController();
  private httpAgent: https.Agent = new https.Agent({
    rejectUnauthorized: false,
  });

  constructor({ url, credentials }: HueBridgeArgs) {
    this.url = url;
    this.credentials = credentials;
  }

  async _request<T extends {}>(
    endpoint,
    options: any = { headers: {}, method: "GET" }
  ): Promise<T> {
    if (!options.headers) {
      options.headers = {};
    }

    if (options.body && options.method !== "GET") {
      options.headers["Content-Type"] = "application/json";
      options.body = JSON.stringify(options.body);
    }

    options.agent = this.httpAgent;
    options.headers["hue-application-key"] = this.credentials.username;

    const response = await fetch(endpoint, options);

    return response.json() as Promise<T>;
  }

  _unwrap<T extends {}>({ errors, data }: JSONResponse<T>) {
    if (!errors || errors.length === 0) {
      return data;
    }

    throw errors[0];
  }

  // Datagram streaming
  async start(id: string): Promise<void> {
    const timeout = 1000;
    const { signal } = this.abortionController;
    this.entertainmentArea = await this.getEntertainmentArea(id);

    await this.updateEntertainmentArea(this.entertainmentArea.id, {
      action: "start",
    });

    this.socket = dtls.createSocket({
      signal,
      timeout,
      port: 2100,
      type: "udp4",
      address: this.url,
      cipherSuites: ["TLS_PSK_WITH_AES_128_GCM_SHA256"],
      psk: {
        [this.credentials.username]: Buffer.from(
          this.credentials.clientkey,
          "hex"
        ),
      },
    } as unknown as dtls.Options);

    return new Promise((resolve) => {
      this.socket.on("connected", () => {
        resolve();
      });
    });
  }

  async stop(): Promise<void> {
    if (!this.socket) {
      throw new Error("No active datagram socket!");
    }

    this.abortionController.abort();

    await this.updateEntertainmentArea(this.entertainmentArea.id, {
      action: "stop",
    });

    this.entertainmentArea = null;
    this.socket.close();
  }

  // #NOTE: one [R,G,B] per channel
  transition(colors: Array<[number, number, number]>) {
    if (!this.socket) {
      throw new Error("No active datagram socket!");
    }

    const protocol = Buffer.from("HueStream");

    // V2.0
    const version = Buffer.from([
      0x02, // major revision
      0x00, // minor revision
    ]);

    const sequenceNumber = Buffer.from([0x00]); // currently ignored
    const reservedSpaces = Buffer.from([0x00, 0x00]);
    const colorMode = Buffer.from([0x00]); // 0 = RGB, 1 = XY
    const reservedSpace = Buffer.from([0x00]);
    const groupId = Buffer.from(this.entertainmentArea.id);

    const rgbChannels = colors.map((rgb, channelIndex) => {
      return Buffer.from([
        channelIndex, // RGB Channel Id
        rgb[0], // R 16bit
        rgb[0], // R 16bit
        rgb[1], // G 16bit
        rgb[1], // G 16bit
        rgb[2], // B 16bit
        rgb[2], // B 16bit
      ]);
    });

    const message = Buffer.concat([
      protocol,
      version,
      sequenceNumber,
      reservedSpaces,
      colorMode,
      reservedSpace,
      groupId,
      ...rgbChannels,
    ]);

    this.socket.send(message);
  }

  // Create
  /*
  addScene(data: Partial<Scene>): Promise<ResourceNode> {}
  addRoom(data: Partial<Room>): Promise<ResourceNode> {}
  addZone(data: Partial<Zone>): Promise<ResourceNode> {}
  addBehaviorInstance(data: Partial<{}>): Promise<ResourceNode> {}
  addGeoFenceClient(data: Partial<{}>): Promise<ResourceNode> {}
  addEntertainmentArea(
    data: Partial<EntertainmentArea>
  ): Promise<ResourceNode> {}
  */

  // Read
  async getLights(): Promise<Light[]> {
    const response = await this._request<JSONResponse<Light[]>>(
      `https://${this.url}/clip/v2/resource/light`
    );

    return this._unwrap(response);
  }

  async getLight(id: string): Promise<Light> {
    const response = await this._request<JSONResponse<Light[]>>(
      `https://${this.url}/clip/v2/resource/light/${id}`
    );

    return this._unwrap(response)[0];
  }

  async getGroupedLights() {
    const response = await this._request<JSONResponse<LightGroup[]>>(
      `https://${this.url}/clip/v2/resource/grouped_light`
    );

    return this._unwrap(response);
  }

  async getLightGroup(id: string) {
    const response = await this._request<JSONResponse<LightGroup[]>>(
      `https://${this.url}/clip/v2/resource/grouped_light/${id}`
    );

    return this._unwrap(response)[0];
  }

  async getScenes(): Promise<Scene[]> {
    const response = await this._request<JSONResponse<Scene[]>>(
      `https://${this.url}/clip/v2/resource/scene`
    );

    return this._unwrap(response);
  }

  async getScene(id: string): Promise<Scene> {
    const response = await this._request<JSONResponse<Scene[]>>(
      `https://${this.url}/clip/v2/resource/scene/${id}`
    );

    return this._unwrap(response)[0];
  }

  async getRooms(): Promise<Room[]> {
    const response = await this._request<JSONResponse<Room[]>>(
      `https://${this.url}/clip/v2/resource/room`
    );

    return this._unwrap(response);
  }

  async getRoom(id: string): Promise<Room> {
    const response = await this._request<JSONResponse<Room[]>>(
      `https://${this.url}/clip/v2/resource/room/${id}`
    );

    return this._unwrap(response)[0];
  }

  async getZones(): Promise<Zone[]> {
    const response = await this._request<JSONResponse<Zone[]>>(
      `https://${this.url}/clip/v2/resource/zone`
    );

    return this._unwrap(response);
  }

  async getZone(id: string): Promise<Zone> {
    const response = await this._request<JSONResponse<Zone[]>>(
      `https://${this.url}/clip/v2/resource/zone/${id}`
    );

    return this._unwrap(response)[0];
  }

  async getEntertainmentAreas(): Promise<EntertainmentArea[]> {
    const response = await this._request<JSONResponse<EntertainmentArea[]>>(
      `https://${this.url}/clip/v2/resource/entertainment_configuration`
    );

    return this._unwrap(response);
  }

  async getEntertainmentArea(id: string): Promise<EntertainmentArea> {
    const response = await this._request<JSONResponse<EntertainmentArea[]>>(
      `https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`
    );

    return this._unwrap(response)[0];
  }

  async getHomeAreas(): Promise<BridgeHome[]> {
    const response = await this._request<JSONResponse<BridgeHome[]>>(
      `https://${this.url}/clip/v2/resource/bridge_home`
    );

    return this._unwrap(response);
  }

  async getHomeArea(id: string): Promise<BridgeHome> {
    const response = await this._request<JSONResponse<BridgeHome[]>>(
      `https://${this.url}/clip/v2/resource/bridge_home/${id}`
    );

    return this._unwrap(response)[0];
  }

  async getDevices(): Promise<Device[]> {
    const response = await this._request<JSONResponse<Device[]>>(
      `https://${this.url}/clip/v2/resource/device`
    );

    return this._unwrap(response);
  }

  async getDevice(id: string): Promise<Device> {
    const response = await this._request<JSONResponse<Device[]>>(
      `https://${this.url}/clip/v2/resource/device/${id}`
    );

    return this._unwrap(response)[0];
  }

  // not implemented yet
  getAllGeoFenceClients() {}
  getGeoFenceClient(id: string) {}

  getEntertainmentServices() {}
  getEntertainmentService(id: string) {}
  getMotionServices() {}
  getMotionService(id: string) {}
  getPowerDeviceServices() {}
  getPowerDeviceService(id: string) {}
  getTemperatureServices() {}
  getTemperatureService(id: string) {}
  getLightLevelServices() {}
  getLightLevelService(id: string) {}
  getButtonServices() {}
  getButtonService(id: string) {}
  getGeolocationServices() {}
  getGeolocationService(id: string) {}
  getHomeKitServices() {}
  getHomeKitService(id: string) {}
  getZigbeeConnectivityServices() {}
  getZigbeeConnectivityService(id: string) {}
  getZigbeeGreenPowerServices() {}
  getZigbeeGreenPowerService(id: string) {}

  getAllBehaviorScripts() {}
  getBehaviorScript(id: string) {}
  getAllBehaviorInstances() {}
  getBehaviorInstance(id: string) {}

  // Update
  async updateEntertainmentArea(
    id: string,
    updates: Partial<EntertainmentArea> & { action: string }
  ): Promise<ResourceNode> {
    const response = await this._request<JSONResponse<ResourceNode[]>>(
      `https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`,
      { method: "PUT", body: updates }
    );

    return this._unwrap(response)[0];
  }

  // not implemented yet
  /*
  updateLight(id: string, updates: {}): Promise<ResourceNode> {}
  updateScene(id: string, updates: {}): Promise<ResourceNode> {}
  updateRoom(id: string, updates: {}): Promise<ResourceNode> {}
  updateZone(id: string, updates: {}): Promise<ResourceNode> {}
  updateHomeArea(id: string, updates: {}): Promise<ResourceNode> {}
  updateLightGroup(id: string, updates: {}): Promise<ResourceNode> {}
  updateDevice(id: string, updates: {}): Promise<ResourceNode> {}
  updateMotionService(id: string, updates: {}): Promise<ResourceNode> {}
  updateTemperatureService(id: string, updates: {}): Promise<ResourceNode> {}
  updateLightLevelService(id: string, updates: {}): Promise<ResourceNode> {}
  updateButtonService(id: string, updates: {}): Promise<ResourceNode> {}
  updateBehaviorInstance(id: string, updates: {}): Promise<ResourceNode> {}
  updateGeoFenceClient(id: string, updates: {}): Promise<ResourceNode> {}
  updateGeoLocationService(id: string, updates: {}): Promise<ResourceNode> {}
  updateEntertainmentService(id: string, updates: {}): Promise<ResourceNode> {}
  updateHomeKitService(id: string, updates: {}): Promise<ResourceNode> {}
  updateDevicePowerService(id: string, updates: {}): Promise<ResourceNode> {}
  updateZigbeeConnectivityService(
    id: string,
    update: {}
  ): Promise<ResourceNode> {}
  updateZigbeeGreenPowerService(
    id: string,
    updates: {}
  ): Promise<ResourceNode> {}
  */

  // Delete
  removeScene(id: string): Promise<{}> {
    return this._request(`https://${this.url}/clip/v2/resource/scene/${id}`, {
      method: "DELETE",
    });
  }
  removeRoom(id: string): Promise<{}> {
    return this._request(`https://${this.url}/clip/v2/resource/room/${id}`, {
      method: "DELETE",
    });
  }
  removeZone(id: string): Promise<{}> {
    return this._request(`https://${this.url}/clip/v2/resource/zone/${id}`, {
      method: "DELETE",
    });
  }
  removeBehaviorInstance(id: string): Promise<{}> {
    return this._request(
      `https://${this.url}/clip/v2/resource/behavior_instance/${id}`,
      {
        method: "DELETE",
      }
    );
  }
  removeGeoFenceClient(id: string): Promise<{}> {
    return this._request(
      `https://${this.url}/clip/v2/resource/geofence_client/${id}`,
      {
        method: "DELETE",
      }
    );
  }
  removeEntertainmentArea(id: string): Promise<{}> {
    return this._request(
      `https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`,
      {
        method: "DELETE",
      }
    );
  }
}
