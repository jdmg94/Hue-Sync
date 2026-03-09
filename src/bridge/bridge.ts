/**
 * Main HueBridge class for interacting with Philips Hue Bridges
 */

import type { RequestOptions } from "../common/types";
import type { ResourceNode } from "../common/types";
import type { BridgeClientCredentials, HueBridgeArgs, BridgeConfig } from "./types";
import type {
  Light,
  Scene,
  Room,
  Zone,
  Device,
  HomeArea,
  LightGroup,
  GeoFenceClient,
  BehaviourInstance,
} from "../resources/types";
import type { EntertainmentArea } from "../streaming/types";
import { ResourceManager } from "../resources/manager";
import { StreamingClient } from "../streaming/client";
import { API_PATHS } from "../constants";

/**
 * Main client for interacting with a Philips Hue Bridge
 */
export class HueBridge {
  readonly id: string;
  readonly url: string;
  private readonly credentials: BridgeClientCredentials;
  private readonly resourceManager: ResourceManager;
  private readonly streamingClient: StreamingClient;

  /**
   * Creates a new HueBridge instance for interacting with a Philips Hue Bridge.
   *
   * @param initial - Bridge configuration including ID, URL, and credentials
   *
   * @example
   * const bridge = new HueBridge({
   *   id: "001788fffe29b4e2",
   *   url: "192.168.1.100",
   *   credentials: { username: "...", clientkey: "..." }
   * });
   */
  constructor(initial: HueBridgeArgs) {
    this.id = initial.id;
    this.url = initial.url;
    this.credentials = initial.credentials;

    // Initialize managers
    this.resourceManager = new ResourceManager(
      this.id,
      this.request.bind(this)
    );
    this.streamingClient = new StreamingClient(
      this.url,
      this.credentials,
      this.updateEntertainmentArea.bind(this)
    );
  }

  /**
   * Internal HTTP request handler
   */
  private async request<T extends {}>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...options.headers,
      "hue-application-key": this.credentials.username,
    };

    const fetchOptions: RequestInit = {
      method: options.method || "GET",
      headers,
      keepalive: options.keepAlive ?? true,
    };

    if (options.body && fetchOptions.method !== "GET") {
      fetchOptions.body = JSON.stringify(options.body);
      headers["Content-Type"] = "application/json";
    }

    const response = await fetch(endpoint, fetchOptions);

    return response.json() as Promise<T>;
  }

  // ========== Bridge Info ==========

  /**
   * Retrieves bridge configuration information.
   *
   * @returns Bridge configuration including version, MAC address, and model
   */
  getInfo(): Promise<BridgeConfig> {
    return this.request<BridgeConfig>(`https://${this.id}${API_PATHS.CONFIG}`);
  }

  // ========== Streaming API ==========

  /**
   * Starts Entertainment API streaming for high-frequency light updates.
   *
   * @param selectedArea - The entertainment area to stream to
   * @param timeout - Socket timeout in milliseconds (default: 1000)
   * @returns Promise that resolves when the connection is established
   */
  async start(selectedArea: EntertainmentArea, timeout?: number): Promise<void> {
    return this.streamingClient.start(selectedArea, timeout);
  }

  /**
   * Stops Entertainment API streaming and closes the DTLS connection.
   */
  stop(): void {
    return this.streamingClient.stop();
  }

  /**
   * Sends color updates to the entertainment area via DTLS streaming.
   *
   * @param colors - Array of [R, G, B] arrays, one per zone/channel
   */
  transition(colors: number[][]): void {
    return this.streamingClient.transition(colors);
  }

  /**
   * Check if streaming is currently active
   */
  get isStreaming(): boolean {
    return this.streamingClient.isStreaming;
  }

  // ========== Lights ==========

  /**
   * Retrieves all lights connected to the bridge.
   */
  async getLights(): Promise<Light[]> {
    return this.resourceManager.getResources("light");
  }

  /**
   * Retrieves a specific light by ID.
   */
  async getLight(id: string): Promise<Light> {
    return this.resourceManager.getResource("light", id);
  }

  /**
   * Updates a light's state (on/off, brightness, color, etc.).
   */
  async updateLight(id: string, updates: Partial<Light>): Promise<ResourceNode> {
    return this.resourceManager.updateResource("light", id, updates);
  }

  // ========== Light Groups ==========

  async getLightGroups(): Promise<LightGroup[]> {
    return this.resourceManager.getResources("lightGroup");
  }

  async getLightGroup(id: string): Promise<LightGroup> {
    return this.resourceManager.getResource("lightGroup", id);
  }

  async updateLightGroup(
    id: string,
    updates: Partial<LightGroup>
  ): Promise<ResourceNode> {
    return this.resourceManager.updateResource("lightGroup", id, updates);
  }

  // ========== Scenes ==========

  async getScenes(): Promise<Scene[]> {
    return this.resourceManager.getResources("scene");
  }

  async getScene(id: string): Promise<Scene> {
    return this.resourceManager.getResource("scene", id);
  }

  async addScene(
    data: Pick<Scene, "metadata" | "group" | "actions">
  ): Promise<ResourceNode> {
    return this.resourceManager.addResource("scene", data);
  }

  async updateScene(id: string, updates: Partial<Scene>): Promise<ResourceNode> {
    return this.resourceManager.updateResource("scene", id, updates);
  }

  async removeScene(id: string): Promise<ResourceNode> {
    return this.resourceManager.deleteResource("scene", id);
  }

  // ========== Rooms ==========

  async getRooms(): Promise<Room[]> {
    return this.resourceManager.getResources("room");
  }

  async getRoom(id: string): Promise<Room> {
    return this.resourceManager.getResource("room", id);
  }

  async addRoom(
    data: Pick<Room, "metadata" | "children">
  ): Promise<ResourceNode> {
    return this.resourceManager.addResource("room", data);
  }

  async updateRoom(id: string, updates: Partial<Room>): Promise<ResourceNode> {
    return this.resourceManager.updateResource("room", id, updates);
  }

  async removeRoom(id: string): Promise<ResourceNode> {
    return this.resourceManager.deleteResource("room", id);
  }

  // ========== Zones ==========

  async getZones(): Promise<Zone[]> {
    return this.resourceManager.getResources("zone");
  }

  async getZone(id: string): Promise<Zone> {
    return this.resourceManager.getResource("zone", id);
  }

  async addZone(
    data: Pick<Zone, "metadata" | "children">
  ): Promise<ResourceNode> {
    return this.resourceManager.addResource("zone", data);
  }

  async updateZone(id: string, updates: Partial<Zone>): Promise<ResourceNode> {
    return this.resourceManager.updateResource("zone", id, updates);
  }

  async removeZone(id: string): Promise<ResourceNode> {
    return this.resourceManager.deleteResource("zone", id);
  }

  // ========== Entertainment Areas ==========

  async getEntertainmentAreas(): Promise<EntertainmentArea[]> {
    return this.resourceManager.getResources("entertainmentArea");
  }

  async getEntertainmentArea(id: string): Promise<EntertainmentArea> {
    return this.resourceManager.getResource("entertainmentArea", id);
  }

  async addEntertainmentArea(
    data: Pick<
      EntertainmentArea,
      "metadata" | "configuration_type" | "locations"
    >
  ): Promise<ResourceNode> {
    return this.resourceManager.addResource("entertainmentArea", data);
  }

  async updateEntertainmentArea(
    id: string,
    updates: Partial<EntertainmentArea> & { action: string }
  ): Promise<ResourceNode> {
    return this.resourceManager.updateResource("entertainmentArea", id, updates);
  }

  async removeEntertainmentArea(id: string): Promise<ResourceNode> {
    return this.resourceManager.deleteResource("entertainmentArea", id);
  }

  // ========== Home Areas ==========

  async getHomeAreas(): Promise<HomeArea[]> {
    return this.resourceManager.getResources("homeArea");
  }

  async getHomeArea(id: string): Promise<HomeArea> {
    return this.resourceManager.getResource("homeArea", id);
  }

  async updateHomeArea(
    id: string,
    updates: Partial<HomeArea>
  ): Promise<ResourceNode> {
    return this.resourceManager.updateResource("homeArea", id, updates);
  }

  // ========== Devices ==========

  async getDevices(): Promise<Device[]> {
    return this.resourceManager.getResources("device");
  }

  async getDevice(id: string): Promise<Device> {
    return this.resourceManager.getResource("device", id);
  }

  async updateDevice(
    id: string,
    updates: Partial<Device>
  ): Promise<ResourceNode> {
    return this.resourceManager.updateResource("device", id, updates);
  }

  // ========== Geofence Clients ==========

  async getGeoFenceClients(): Promise<GeoFenceClient[]> {
    return this.resourceManager.getResources("geoFenceClient");
  }

  async getGeoFenceClient(id: string): Promise<GeoFenceClient> {
    return this.resourceManager.getResource("geoFenceClient", id);
  }

  async addGeoFenceClient(
    data: Pick<GeoFenceClient, "name" | "is_at_home" | "type">
  ): Promise<ResourceNode> {
    return this.resourceManager.addResource("geoFenceClient", data);
  }

  async updateGeoFenceClient(
    id: string,
    updates: Partial<GeoFenceClient>
  ): Promise<ResourceNode> {
    return this.resourceManager.updateResource("geoFenceClient", id, updates);
  }

  async removeGeoFenceClient(id: string): Promise<ResourceNode> {
    return this.resourceManager.deleteResource("geoFenceClient", id);
  }

  // ========== Behavior Instances ==========

  async getBehaviorInstances(): Promise<BehaviourInstance[]> {
    return this.resourceManager.getResources("behaviorInstance");
  }

  async getBehaviorInstance(id: string): Promise<BehaviourInstance> {
    return this.resourceManager.getResource("behaviorInstance", id);
  }

  async addBehaviorInstance(
    data: Pick<
      BehaviourInstance,
      | "type"
      | "metadata"
      | "configuration"
      | "enabled"
      | "script_id"
      | "migrated_from"
    >
  ): Promise<ResourceNode> {
    return this.resourceManager.addResource("behaviorInstance", data);
  }

  async updateBehaviorInstance(
    id: string,
    updates: Partial<BehaviourInstance>
  ): Promise<ResourceNode> {
    return this.resourceManager.updateResource("behaviorInstance", id, updates);
  }

  async removeBehaviorInstance(id: string): Promise<ResourceNode> {
    return this.resourceManager.deleteResource("behaviorInstance", id);
  }
}
