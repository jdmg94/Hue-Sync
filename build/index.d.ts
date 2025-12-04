declare interface BaseResouce {
    id: string;
    id_v1?: string;
    type: string;
}

export declare interface BehaviourInstance extends BaseResouce {
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

export declare interface BridgeClientCredentials {
    username: string;
    clientkey: string;
}

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

export declare interface Device extends BaseResouce {
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

export declare interface EntertainmentArea extends BaseResouce {
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

declare interface EntertainmentAreaChannel {
    channel_id: number;
    position: Position[];
    members: Array<{
        index: number;
        service: ResourceNode;
    }>;
}

export declare interface GeoFenceClient extends BaseResouce {
    is_at_home?: boolean;
    name: string;
}

export declare interface HomeArea extends BaseResouce {
    children: ResourceNode[];
    grouped_services: ResourceNode[];
    services: ResourceNode[];
}

declare class HueBridge {
    static discover(): Promise<HueBridgeNetworkDevice[]>;
    static register(url: string, devicetype?: string): Promise<BridgeClientCredentials>;
    id: string;
    url: string;
    private socket;
    private abortionController;
    private entertainmentArea;
    private credentials;
    constructor(initial: HueBridgeArgs);
    private _request;
    private _unwrap;
    start(selectedArea: EntertainmentArea, timeout?: number): Promise<void>;
    stop(): void;
    transition(colors: number[][]): void;
    addScene(data: Pick<Scene, "metadata" | "group" | "actions">): Promise<ResourceNode>;
    addRoom(data: Pick<Room, "metadata" | "children">): Promise<ResourceNode>;
    addZone(data: Pick<Zone, "metadata" | "children">): Promise<ResourceNode>;
    addEntertainmentArea(data: Pick<EntertainmentArea, "metadata" | "configuration_type" | "locations">): Promise<ResourceNode>;
    addGeoFenceClient(data: Pick<GeoFenceClient, "name" | "is_at_home" | "type">): Promise<ResourceNode>;
    addBehaviorInstance(data: Pick<BehaviourInstance, "type" | "metadata" | "configuration" | "enabled" | "script_id" | "migrated_from">): Promise<ResourceNode>;
    getInfo(): Promise<BridgeConfig>;
    getLights(): Promise<Light[]>;
    getLight(id: string): Promise<Light>;
    getLightGroups(): Promise<LightGroup[]>;
    getLightGroup(id: string): Promise<LightGroup>;
    getScenes(): Promise<Scene[]>;
    getScene(id: string): Promise<Scene>;
    getRooms(): Promise<Room[]>;
    getRoom(id: string): Promise<Room>;
    getZones(): Promise<Zone[]>;
    getZone(id: string): Promise<Zone>;
    getEntertainmentAreas(): Promise<EntertainmentArea[]>;
    getEntertainmentArea(id: string): Promise<EntertainmentArea>;
    getHomeAreas(): Promise<HomeArea[]>;
    getHomeArea(id: string): Promise<HomeArea>;
    getDevices(): Promise<Device[]>;
    getDevice(id: string): Promise<Device>;
    getAllGeoFenceClients(): Promise<GeoFenceClient[]>;
    getGeoFenceClient(id: string): Promise<GeoFenceClient>;
    getAllBehaviorInstances(): Promise<BehaviourInstance[]>;
    getBehaviorInstance(id: string): Promise<BehaviourInstance>;
    updateEntertainmentArea(id: string, updates: Partial<EntertainmentArea> & {
        action: string;
    }): Promise<ResourceNode>;
    updateLight(id: string, updates: Partial<Light>): Promise<ResourceNode>;
    updateScene(id: string, updates: Partial<Scene>): Promise<ResourceNode>;
    updateRoom(id: string, updates: Partial<Room>): Promise<ResourceNode>;
    updateZone(id: string, updates: Partial<Zone>): Promise<ResourceNode>;
    updateHomeArea(id: string, updates: Partial<HomeArea>): Promise<ResourceNode>;
    updateLightGroup(id: string, updates: Partial<LightGroup>): Promise<ResourceNode>;
    updateDevice(id: string, updates: Partial<Device>): Promise<ResourceNode>;
    updateBehaviorInstance(id: string, updates: Partial<BehaviourInstance>): Promise<ResourceNode>;
    updateGeoFenceClient(id: string, updates: Partial<GeoFenceClient>): Promise<ResourceNode>;
    removeScene(id: string): Promise<ResourceNode>;
    removeRoom(id: string): Promise<ResourceNode>;
    removeZone(id: string): Promise<ResourceNode>;
    removeBehaviorInstance(id: string): Promise<ResourceNode>;
    removeGeoFenceClient(id: string): Promise<ResourceNode>;
    removeEntertainmentArea(id: string): Promise<ResourceNode>;
}
export default HueBridge;

export declare interface HueBridgeArgs {
    id: string;
    url: string;
    credentials: BridgeClientCredentials;
}

export declare interface HueBridgeNetworkDevice {
    id: string;
    port?: number;
    internalipaddress?: string;
}

export declare type JSONResponse<T extends {}> = {
    errors?: Error[];
    data: T;
};

export declare interface Light extends BaseResouce {
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

declare interface LightDimming {
    brightness: number;
    min_dim_level?: number;
}

export declare interface LightGroup extends BaseResouce {
    alert: {
        action_values: string[];
    };
    on: OnState;
}

export declare interface OnState {
    on: boolean;
}

export declare interface Position {
    x: number;
    y: number;
    z: number;
}

export declare interface ResourceNode {
    rid: string;
    rtype: "device" | "bridge_home" | "room" | "zone" | "light" | "button" | "temperature" | "light_level" | "motion" | "entertainment" | "grouped_light" | "device_power" | "zigbee_bridge_connectivity" | "zigbee_connectivity" | "zgp_connectivity" | "bridge" | "homekit" | "scene" | "entertainment_configuration" | "public_image" | "auth_v1" | "behavior_script" | "behavior_instance" | "geofence" | "geofence_client" | "geolocation" | "_test";
}

export declare interface Room extends BaseResouce {
    children: ResourceNode[];
    grouped_services?: ResourceNode[];
    metadata: {
        archetype?: string;
        name: string;
    };
    services?: ResourceNode[];
}

export declare interface Scene extends BaseResouce {
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

declare interface ServiceLocation {
    position: Position;
    positions: Position[];
    service: ResourceNode;
}

export declare interface xy {
    x: number;
    y: number;
}

export declare interface Zone extends BaseResouce {
    children: ResourceNode[];
    services?: ResourceNode[];
    grouped_services?: ResourceNode[];
    metadata: {
        name: string;
        archetype?: string;
    };
}

export { }
