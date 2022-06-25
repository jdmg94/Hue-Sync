"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = void 0;
var https = _interopRequireWildcard(require("https"));
var _nodeDtlsClient = require("node-dtls-client");
function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
        return obj;
    } else {
        var newObj = {};
        if (obj != null) {
            for(var key in obj){
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {};
                    if (desc.get || desc.set) {
                        Object.defineProperty(newObj, key, desc);
                    } else {
                        newObj[key] = obj[key];
                    }
                }
            }
        }
        newObj.default = obj;
        return newObj;
    }
}
class HueBridge {
    static async discover() {
        const response = await fetch("https://discovery.meethue.com/");
        return response.json();
    }
    static async getInfo(url) {
        const response = await fetch(`https://${url}/api/config`);
        return response.json();
    }
    static async register(url, devicetype = "hue-sync") {
        const endpoint = `https://${url}/api`;
        const body = JSON.stringify({
            devicetype,
            generateclientkey: true
        });
        const response = await fetch(endpoint, {
            body,
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const [{ error , success  }] = await response.json();
        if (error) throw error;
        return success;
    }
    async _request(endpoint, options = {
        headers: {},
        method: "GET"
    }) {
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
        return response.json();
    }
    _unwrap({ errors , data  }) {
        if (!errors || errors.length === 0) {
            return data;
        }
        throw errors[0];
    }
    // Datagram streaming
    async start(id) {
        const timeout = 1000;
        const { signal  } = this.abortionController;
        this.entertainmentArea = await this.getEntertainmentArea(id);
        await this.updateEntertainmentArea(this.entertainmentArea.id, {
            action: "start"
        });
        this.socket = _nodeDtlsClient.dtls.createSocket({
            signal,
            timeout,
            port: 2100,
            type: "udp4",
            address: this.url,
            cipherSuites: [
                "TLS_PSK_WITH_AES_128_GCM_SHA256"
            ],
            psk: {
                [this.credentials.username]: Buffer.from(this.credentials.clientkey, "hex")
            }
        });
        return new Promise((resolve)=>{
            this.socket.on("connected", ()=>{
                resolve();
            });
        });
    }
    async stop() {
        if (!this.socket) {
            throw new Error("No active datagram socket!");
        }
        this.abortionController.abort();
        await this.updateEntertainmentArea(this.entertainmentArea.id, {
            action: "stop"
        });
        this.entertainmentArea = null;
        this.socket.close();
    }
    // #NOTE: one [R,G,B] per channel
    transition(colors) {
        if (!this.socket) {
            throw new Error("No active datagram socket!");
        }
        const protocol = Buffer.from("HueStream");
        // V2.0
        const version = Buffer.from([
            0x02,
            0x00
        ]);
        const sequenceNumber = Buffer.from([
            0x00
        ]); // currently ignored
        const reservedSpaces = Buffer.from([
            0x00,
            0x00
        ]);
        const colorMode = Buffer.from([
            0x00
        ]); // 0 = RGB, 1 = XY
        const reservedSpace = Buffer.from([
            0x00
        ]);
        const groupId = Buffer.from(this.entertainmentArea.id);
        const rgbChannels = colors.map((rgb, channelIndex)=>{
            return Buffer.from([
                channelIndex,
                rgb[0],
                rgb[0],
                rgb[1],
                rgb[1],
                rgb[2],
                rgb[2]
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
  */ // Read
    async getLights() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/light`);
        return this._unwrap(response);
    }
    async getLight(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/light/${id}`);
        return this._unwrap(response)[0];
    }
    async getGroupedLights() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/grouped_light`);
        return this._unwrap(response);
    }
    async getLightGroup(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/grouped_light/${id}`);
        return this._unwrap(response)[0];
    }
    async getScenes() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/scene`);
        return this._unwrap(response);
    }
    async getScene(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/scene/${id}`);
        return this._unwrap(response)[0];
    }
    async getRooms() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/room`);
        return this._unwrap(response);
    }
    async getRoom(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/room/${id}`);
        return this._unwrap(response)[0];
    }
    async getZones() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/zone`);
        return this._unwrap(response);
    }
    async getZone(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/zone/${id}`);
        return this._unwrap(response)[0];
    }
    async getEntertainmentAreas() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/entertainment_configuration`);
        return this._unwrap(response);
    }
    async getEntertainmentArea(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`);
        return this._unwrap(response)[0];
    }
    async getHomeAreas() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/bridge_home`);
        return this._unwrap(response);
    }
    async getHomeArea(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/bridge_home/${id}`);
        return this._unwrap(response)[0];
    }
    async getDevices() {
        const response = await this._request(`https://${this.url}/clip/v2/resource/device`);
        return this._unwrap(response);
    }
    async getDevice(id) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/device/${id}`);
        return this._unwrap(response)[0];
    }
    // not implemented yet
    getAllGeoFenceClients() {}
    getGeoFenceClient(id) {}
    getEntertainmentServices() {}
    getEntertainmentService(id) {}
    getMotionServices() {}
    getMotionService(id) {}
    getPowerDeviceServices() {}
    getPowerDeviceService(id) {}
    getTemperatureServices() {}
    getTemperatureService(id) {}
    getLightLevelServices() {}
    getLightLevelService(id) {}
    getButtonServices() {}
    getButtonService(id) {}
    getGeolocationServices() {}
    getGeolocationService(id) {}
    getHomeKitServices() {}
    getHomeKitService(id) {}
    getZigbeeConnectivityServices() {}
    getZigbeeConnectivityService(id) {}
    getZigbeeGreenPowerServices() {}
    getZigbeeGreenPowerService(id) {}
    getAllBehaviorScripts() {}
    getBehaviorScript(id) {}
    getAllBehaviorInstances() {}
    getBehaviorInstance(id) {}
    // Update
    async updateEntertainmentArea(id, updates) {
        const response = await this._request(`https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`, {
            method: "PUT",
            body: updates
        });
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
  */ // Delete
    removeScene(id) {
        return this._request(`https://${this.url}/clip/v2/resource/scene/${id}`, {
            method: "DELETE"
        });
    }
    removeRoom(id) {
        return this._request(`https://${this.url}/clip/v2/resource/room/${id}`, {
            method: "DELETE"
        });
    }
    removeZone(id) {
        return this._request(`https://${this.url}/clip/v2/resource/zone/${id}`, {
            method: "DELETE"
        });
    }
    removeBehaviorInstance(id) {
        return this._request(`https://${this.url}/clip/v2/resource/behavior_instance/${id}`, {
            method: "DELETE"
        });
    }
    removeGeoFenceClient(id) {
        return this._request(`https://${this.url}/clip/v2/resource/geofence_client/${id}`, {
            method: "DELETE"
        });
    }
    removeEntertainmentArea(id) {
        return this._request(`https://${this.url}/clip/v2/resource/entertainment_configuration/${id}`, {
            method: "DELETE"
        });
    }
    constructor(initial){
        // properties
        this.url = null;
        this.socket = null;
        this.entertainmentArea = null;
        this.credentials = null;
        this.abortionController = new AbortController();
        this.httpAgent = new https.Agent({
            rejectUnauthorized: false
        });
        if (!(initial.url && initial.credentials)) {
            throw new Error("Missing required arguments");
        }
        this.url = initial.url;
        this.credentials = initial.credentials;
        if (initial.httpAgent) {
            this.httpAgent = initial.httpAgent;
        }
    }
}
exports.default = HueBridge;
