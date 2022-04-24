import { Room, Zone, Light, Scene, Device, BridgeHome, ResourceNode, BridgeConfig, EntertainmentArea, HueBridgeNetworkDevice, BridgeClientCredentials, LightGroup } from "./hue.types";
interface HueBridgeArgs {
    url: string;
    credentials: BridgeClientCredentials;
}
declare type JSONResponse<T extends {}> = {
    errors?: Error[];
    data: T;
};
export default class HueBridge {
    static discover(): Promise<HueBridgeNetworkDevice[]>;
    static getInfo(url: string): Promise<BridgeConfig>;
    static register(url: string, devicetype?: string): Promise<BridgeClientCredentials>;
    private url;
    private socket;
    private entertainmentArea;
    private credentials;
    private abortionController;
    private httpAgent;
    constructor({ url, credentials }: HueBridgeArgs);
    _request<T extends {}>(endpoint: any, options?: any): Promise<T>;
    _unwrap<T extends {}>({ errors, data }: JSONResponse<T>): T;
    start(id: string): Promise<void>;
    stop(): Promise<void>;
    transition(colors: Array<[number, number, number]>): void;
    getLights(): Promise<Light[]>;
    getLight(id: string): Promise<Light>;
    getGroupedLights(): Promise<LightGroup[]>;
    getLightGroup(id: string): Promise<LightGroup>;
    getScenes(): Promise<Scene[]>;
    getScene(id: string): Promise<Scene>;
    getRooms(): Promise<Room[]>;
    getRoom(id: string): Promise<Room>;
    getZones(): Promise<Zone[]>;
    getZone(id: string): Promise<Zone>;
    getEntertainmentAreas(): Promise<EntertainmentArea[]>;
    getEntertainmentArea(id: string): Promise<EntertainmentArea>;
    getHomeAreas(): Promise<BridgeHome[]>;
    getHomeArea(id: string): Promise<BridgeHome>;
    getDevices(): Promise<Device[]>;
    getDevice(id: string): Promise<Device>;
    getAllGeoFenceClients(): void;
    getGeoFenceClient(id: string): void;
    getEntertainmentServices(): void;
    getEntertainmentService(id: string): void;
    getMotionServices(): void;
    getMotionService(id: string): void;
    getPowerDeviceServices(): void;
    getPowerDeviceService(id: string): void;
    getTemperatureServices(): void;
    getTemperatureService(id: string): void;
    getLightLevelServices(): void;
    getLightLevelService(id: string): void;
    getButtonServices(): void;
    getButtonService(id: string): void;
    getGeolocationServices(): void;
    getGeolocationService(id: string): void;
    getHomeKitServices(): void;
    getHomeKitService(id: string): void;
    getZigbeeConnectivityServices(): void;
    getZigbeeConnectivityService(id: string): void;
    getZigbeeGreenPowerServices(): void;
    getZigbeeGreenPowerService(id: string): void;
    getAllBehaviorScripts(): void;
    getBehaviorScript(id: string): void;
    getAllBehaviorInstances(): void;
    getBehaviorInstance(id: string): void;
    updateEntertainmentArea(id: string, updates: Partial<EntertainmentArea> & {
        action: string;
    }): Promise<ResourceNode>;
    removeScene(id: string): Promise<{}>;
    removeRoom(id: string): Promise<{}>;
    removeZone(id: string): Promise<{}>;
    removeBehaviorInstance(id: string): Promise<{}>;
    removeGeoFenceClient(id: string): Promise<{}>;
    removeEntertainmentArea(id: string): Promise<{}>;
}
export {};
//# sourceMappingURL=hue.d.ts.map