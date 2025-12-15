export declare const API_PATHS: {
    readonly CONFIG: "/api/0/config";
    readonly CLIP_V2_RESOURCE: "/clip/v2/resource";
};

/**
 * Base interface for all Hue resources
 */
declare interface BaseResource {
    id: string;
    id_v1?: string;
    type: string;
}

/**
 * Behavior instance resource
 */
export declare interface BehaviourInstance extends BaseResource {
    script_id: string;
    enabled: boolean;
    state?: {};
    configuration: {};
    last_error?: string;
    migrated_from?: string;
    metadata: {
        name: string;
    };
    status: "initializing" | "running" | "disabled" | "errored";
    dependees: Array<{
        type: string;
        target: ResourceNode;
        level: "critical" | "non_critical";
    }>;
}

/**
 * Bridge-specific types and configurations
 */
/**
 * Bridge client credentials obtained during registration
 */
export declare interface BridgeClientCredentials {
    username: string;
    clientkey: string;
}

/**
 * Bridge configuration information
 */
export declare interface BridgeConfig {
    name: string;
    datastoreversion: string;
    swversion: string;
    apiversion: string;
    mac: string;
    bridgeid: string;
    factorynew: boolean;
    replacesbridgeid?: string;
    modelid: string;
    starterkitid?: string;
}

/**
 * Device resource
 */
export declare interface Device extends BaseResource {
    services: ResourceNode[];
    metadata: {
        name?: string;
        archetype?: "bridge_v2" | "unknown_archetype" | "classic_bulb" | "sultan_bulb" | "flood_bulb" | "spot_bulb" | "candle_bulb" | "luster_bulb" | "pendant_round" | "pendant_long" | "ceiling_round" | "ceiling_square" | "floor_shade" | "floor_lantern" | "table_shade" | "recessed_ceiling" | "recessed_floor" | "single_spot" | "double_spot" | "table_wash" | "wall_lantern" | "wall_shade" | "flexible_lamp" | "ground_spot" | "wall_spot" | "plug" | "hue_go" | "hue_lightstrip" | "hue_iris" | "hue_bloom" | "bollard" | "wall_washer" | "hue_play" | "vintage_bulb" | "christmas_tree" | "hue_centris" | "hue_lightstrip_tv" | "hue_tube" | "hue_signe";
    };
    product_data: {
        certified: boolean;
        manufacturer_name: string;
        model_id: string;
        product_archetype: string;
        product_name: string;
        software_version: string;
    };
}

/**
 * Discovers Philips Hue Bridges on the local network using mDNS.
 * Falls back to Philips cloud discovery API if mDNS fails.
 *
 * @returns Array of discovered bridge devices
 * @throws {HueBridgeDiscoveryError} If both mDNS and cloud API discovery fail
 *
 * @example
 * const bridges = await discover();
 * console.log(`Found ${bridges.length} bridge(s)`);
 */
export declare function discover(): Promise<HueBridgeNetworkDevice[]>;

export declare const DISCOVERY: {
    readonly MDNS_SERVICE: "_hue._tcp.local";
    readonly CLOUD_API: "https://discovery.meethue.com/";
};

export declare const ENTERTAINMENT_API: {
    readonly PORT: 2100;
    readonly PROTOCOL_NAME: "HueStream";
    readonly PROTOCOL_VERSION: readonly [2, 0];
    readonly SEQUENCE_NUMBER: 0;
    readonly RESERVED_SPACE: 0;
    readonly COLOR_MODE: {
        readonly RGB: 0;
        readonly XY: 1;
    };
    readonly CIPHER_SUITE: "TLS_PSK_WITH_AES_128_GCM_SHA256";
    readonly DEFAULT_TIMEOUT: 1000;
};

/**
 * Entertainment area resource for streaming
 */
export declare interface EntertainmentArea {
    id: string;
    id_v1?: string;
    type: string;
    name: string;
    metadata: {
        name: string;
    };
    channels: EntertainmentAreaChannel[];
    configuration_type: string;
    light_services: ResourceNode[];
    locations: {
        service_locations: ServiceLocation[];
    };
    status: string;
    stream_proxy: {
        mode: string;
        node: ResourceNode;
    };
}

/**
 * Entertainment area channel configuration
 */
declare interface EntertainmentAreaChannel {
    channel_id: number;
    position: Position[];
    members: Array<{
        index: number;
        service: ResourceNode;
    }>;
}

/**
 * Geofence client resource
 */
export declare interface GeoFenceClient extends BaseResource {
    is_at_home?: boolean;
    name: string;
}

/**
 * Home area resource
 */
export declare interface HomeArea extends BaseResource {
    children: ResourceNode[];
    grouped_services: ResourceNode[];
    services: ResourceNode[];
}

/**
 * Main client for interacting with a Philips Hue Bridge
 */
declare class HueBridge {
    readonly id: string;
    readonly url: string;
    private readonly credentials;
    private readonly resourceManager;
    private readonly streamingClient;
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
    constructor(initial: HueBridgeArgs);
    /**
     * Internal HTTP request handler
     */
    private request;
    /**
     * Retrieves bridge configuration information.
     *
     * @returns Bridge configuration including version, MAC address, and model
     */
    getInfo(): Promise<BridgeConfig>;
    /**
     * Starts Entertainment API streaming for high-frequency light updates.
     *
     * @param selectedArea - The entertainment area to stream to
     * @param timeout - Socket timeout in milliseconds (default: 1000)
     * @returns Promise that resolves when the connection is established
     */
    start(selectedArea: EntertainmentArea, timeout?: number): Promise<void>;
    /**
     * Stops Entertainment API streaming and closes the DTLS connection.
     */
    stop(): void;
    /**
     * Sends color updates to the entertainment area via DTLS streaming.
     *
     * @param colors - Array of [R, G, B] arrays, one per zone/channel
     */
    transition(colors: number[][]): void;
    /**
     * Check if streaming is currently active
     */
    get isStreaming(): boolean;
    /**
     * Retrieves all lights connected to the bridge.
     */
    getLights(): Promise<Light[]>;
    /**
     * Retrieves a specific light by ID.
     */
    getLight(id: string): Promise<Light>;
    /**
     * Updates a light's state (on/off, brightness, color, etc.).
     */
    updateLight(id: string, updates: Partial<Light>): Promise<ResourceNode>;
    getLightGroups(): Promise<LightGroup[]>;
    getLightGroup(id: string): Promise<LightGroup>;
    updateLightGroup(id: string, updates: Partial<LightGroup>): Promise<ResourceNode>;
    getScenes(): Promise<Scene[]>;
    getScene(id: string): Promise<Scene>;
    addScene(data: Pick<Scene, "metadata" | "group" | "actions">): Promise<ResourceNode>;
    updateScene(id: string, updates: Partial<Scene>): Promise<ResourceNode>;
    removeScene(id: string): Promise<ResourceNode>;
    getRooms(): Promise<Room[]>;
    getRoom(id: string): Promise<Room>;
    addRoom(data: Pick<Room, "metadata" | "children">): Promise<ResourceNode>;
    updateRoom(id: string, updates: Partial<Room>): Promise<ResourceNode>;
    removeRoom(id: string): Promise<ResourceNode>;
    getZones(): Promise<Zone[]>;
    getZone(id: string): Promise<Zone>;
    addZone(data: Pick<Zone, "metadata" | "children">): Promise<ResourceNode>;
    updateZone(id: string, updates: Partial<Zone>): Promise<ResourceNode>;
    removeZone(id: string): Promise<ResourceNode>;
    getEntertainmentAreas(): Promise<EntertainmentArea[]>;
    getEntertainmentArea(id: string): Promise<EntertainmentArea>;
    addEntertainmentArea(data: Pick<EntertainmentArea, "metadata" | "configuration_type" | "locations">): Promise<ResourceNode>;
    updateEntertainmentArea(id: string, updates: Partial<EntertainmentArea> & {
        action: string;
    }): Promise<ResourceNode>;
    removeEntertainmentArea(id: string): Promise<ResourceNode>;
    getHomeAreas(): Promise<HomeArea[]>;
    getHomeArea(id: string): Promise<HomeArea>;
    updateHomeArea(id: string, updates: Partial<HomeArea>): Promise<ResourceNode>;
    getDevices(): Promise<Device[]>;
    getDevice(id: string): Promise<Device>;
    updateDevice(id: string, updates: Partial<Device>): Promise<ResourceNode>;
    getGeoFenceClients(): Promise<GeoFenceClient[]>;
    getGeoFenceClient(id: string): Promise<GeoFenceClient>;
    addGeoFenceClient(data: Pick<GeoFenceClient, "name" | "is_at_home" | "type">): Promise<ResourceNode>;
    updateGeoFenceClient(id: string, updates: Partial<GeoFenceClient>): Promise<ResourceNode>;
    removeGeoFenceClient(id: string): Promise<ResourceNode>;
    getBehaviorInstances(): Promise<BehaviourInstance[]>;
    getBehaviorInstance(id: string): Promise<BehaviourInstance>;
    addBehaviorInstance(data: Pick<BehaviourInstance, "type" | "metadata" | "configuration" | "enabled" | "script_id" | "migrated_from">): Promise<ResourceNode>;
    updateBehaviorInstance(id: string, updates: Partial<BehaviourInstance>): Promise<ResourceNode>;
    removeBehaviorInstance(id: string): Promise<ResourceNode>;
}
export { HueBridge }
export default HueBridge;

export declare class HueBridgeApiError extends HueBridgeError {
    readonly errors: Error[];
    constructor(message: string, errors: Error[]);
}

/**
 * Bridge configuration arguments
 */
export declare interface HueBridgeArgs {
    id: string;
    url: string;
    credentials: BridgeClientCredentials;
}

export declare class HueBridgeAuthError extends HueBridgeError {
    constructor(message: string);
}

export declare class HueBridgeDiscoveryError extends HueBridgeError {
    readonly cause?: unknown;
    constructor(message: string, cause?: unknown);
}

export declare class HueBridgeError extends Error {
    constructor(message: string);
}

/**
 * Bridge network device information
 */
export declare interface HueBridgeNetworkDevice {
    id: string;
    port?: number;
    internalipaddress?: string;
}

export declare class HueBridgeNetworkError extends HueBridgeError {
    readonly cause?: unknown;
    constructor(message: string, cause?: unknown);
}

export declare class HueBridgeStreamError extends HueBridgeError {
    constructor(message: string);
}

/**
 * Common types shared across the Hue Sync library
 */
/**
 * Generic JSON response wrapper from Hue Bridge API
 */
export declare interface JSONResponse<T extends {}> {
    errors?: Error[];
    data: T;
}

/**
 * Light resource
 */
export declare interface Light extends BaseResource {
    alert: {
        action_values: string[];
    };
    color: {
        gamut: {
            blue: xy;
            green: xy;
            red: xy;
        };
        gamut_type: string;
        xy: xy;
    };
    color_temperature: {
        mirek: number;
        mirek_schema?: {
            mirek_maximum: number;
            mirek_minimum: number;
        };
        mirek_valid?: boolean;
    };
    dimming: LightDimming;
    dynamics: {
        speed: number;
        speed_valid: boolean;
        status: string;
        status_values: string[];
    };
    effects: {
        effect_values: string[];
        status: string;
        status_values: string[];
    };
    gradient?: {
        points: Array<{
            color: {
                xy: xy;
            };
        }>;
        points_capable: number;
    };
    metadata: {
        archetype?: string;
        name: string;
    };
    mode: string;
    on: OnState;
    owner: ResourceNode;
}

/**
 * Light dimming settings
 */
declare interface LightDimming {
    brightness: number;
    min_dim_level?: number;
}

/**
 * Light group resource
 */
export declare interface LightGroup extends BaseResource {
    alert: {
        action_values: string[];
    };
    on: OnState;
}

/**
 * On/Off state
 */
export declare interface OnState {
    on: boolean;
}

/**
 * 3D position coordinates
 */
export declare interface Position {
    x: number;
    y: number;
    z: number;
}

/**
 * Registers the application with a Hue Bridge to obtain credentials.
 * The physical button on the bridge must be pressed before calling this method.
 *
 * @param url - The IP address of the bridge
 * @param devicetype - The application identifier (default: "hue-sync")
 * @returns Bridge client credentials (username and clientkey)
 * @throws {Error} If the link button was not pressed or registration fails
 *
 * @example
 * const credentials = await register("192.168.1.100");
 * // Save credentials for future use
 */
export declare function register(url: string, devicetype?: string): Promise<BridgeClientCredentials>;

/**
 * Request options for HTTP requests to the bridge
 */
export declare interface RequestOptions {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    headers?: Record<string, string>;
    body?: unknown;
    keepAlive?: boolean;
}

/**
 * Mapping of resource types to their API endpoint paths
 */
export declare const RESOURCE_ENDPOINTS: {
    readonly light: "light";
    readonly lightGroup: "grouped_light";
    readonly scene: "scene";
    readonly room: "room";
    readonly zone: "zone";
    readonly entertainmentArea: "entertainment_configuration";
    readonly homeArea: "bridge_home";
    readonly device: "device";
    readonly geoFenceClient: "geofence_client";
    readonly behaviorInstance: "behavior_instance";
};

export declare type ResourceEndpointKey = keyof typeof RESOURCE_ENDPOINTS;

/**
 * Resource reference node used in Hue API responses
 */
export declare interface ResourceNode {
    rid: string;
    rtype: "device" | "bridge_home" | "room" | "zone" | "light" | "button" | "temperature" | "light_level" | "motion" | "entertainment" | "grouped_light" | "device_power" | "zigbee_bridge_connectivity" | "zigbee_connectivity" | "zgp_connectivity" | "bridge" | "homekit" | "scene" | "entertainment_configuration" | "public_image" | "auth_v1" | "behavior_script" | "behavior_instance" | "geofence" | "geofence_client" | "geolocation" | "_test";
}

/**
 * Type mapping from resource keys to their TypeScript interfaces
 */
export declare interface ResourceTypeMap {
    light: Light;
    lightGroup: LightGroup;
    scene: Scene;
    room: Room;
    zone: Zone;
    entertainmentArea: EntertainmentArea;
    homeArea: HomeArea;
    device: Device;
    geoFenceClient: GeoFenceClient;
    behaviorInstance: BehaviourInstance;
}

/**
 * Room resource
 */
export declare interface Room extends BaseResource {
    children: ResourceNode[];
    grouped_services?: ResourceNode[];
    metadata: {
        archetype?: string;
        name: string;
    };
    services?: ResourceNode[];
}

/**
 * Scene resource
 */
export declare interface Scene extends BaseResource {
    speed?: number;
    group: ResourceNode;
    actions: SceneAction[];
    metadata: {
        image?: ResourceNode;
        name: string;
    };
    palette?: {
        color: xy;
        dimming: LightDimming;
        color_temperature: Array<{
            color_temperature: {
                mirek: number;
            };
            dimming?: LightDimming;
        }>;
    };
}

/**
 * Scene action definition
 */
declare interface SceneAction {
    target: ResourceNode;
    action: {
        on?: OnState;
        dimming?: LightDimming;
        color_temperature?: {
            mirek: number;
        };
    };
}

/**
 * Service location within an entertainment area
 */
declare interface ServiceLocation {
    position: Position;
    positions: Position[];
    service: ResourceNode;
}

/**
 * XY color coordinates
 */
export declare interface xy {
    x: number;
    y: number;
}

/**
 * Zone resource
 */
export declare interface Zone extends BaseResource {
    children: ResourceNode[];
    services?: ResourceNode[];
    grouped_services?: ResourceNode[];
    metadata: {
        name: string;
        archetype?: string;
    };
}

export { }
