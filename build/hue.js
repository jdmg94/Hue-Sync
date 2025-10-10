"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = void 0;
const https = require("https");
const axios = require("axios");
const dns = require("dns");
const _nodeDnsSd = _interopRequireDefault(require("node-dns-sd"));
const _nodeDtlsClient = require("node-dtls-client");

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { default: obj };
}

function createAgent(domain, ip) {
    const agent = new https.Agent({
        lookup: (hostname, options, callback) => {
            if (hostname === domain) {
                if (options && options.all) {
                    return callback(null, [{ address: ip, family: 4 }]);
                } else {
                    return callback(null, ip, 4);
                }
            }
            return dns.lookup(hostname, options, callback);
        }
    });
    return agent;
}

class HueBridge {
    static async discover() {
        try {
            const localSearch = await _nodeDnsSd.default.discover({
                name: "_hue._tcp.local",
            });
            return localSearch.map((item) => {
                const port = item.service.port;
                const internalipaddress = item.address;
                const [buffer] = item.packet.additionals;
                const id = buffer.rdata.bridgeid;
                return { id, port, internalipaddress };
            });
        } catch {null
            const response = await axios.get("https://discovery.meethue.com/");
            return response.data;
        }
    }

    static async register(url, devicetype = "hue-sync") {
        const endpoint = `http://${url}/api`;
        const body = { devicetype, generateclientkey: true };
        const response = await axios.post(endpoint, body, {
            headers: { "Content-Type": "application/json" },
        });
        const [{ error, success }] = response.data;
        if (error) throw error;
        return success;
    }

    async _request(endpoint, options = { headers: {}, method: "GET" }) {
        if (!options.headers) {
            options.headers = {};
        }

        const config = {
            method: options.method || "GET",
            url: endpoint,
            headers: {
                ...options.headers,
                "hue-application-key": this.credentials.username,
            },
            data: options.body || undefined,
            timeout: 10000,
            httpsAgent: this.agent,
        };

        const response = await axios(config);
        return response.data;
    }


    _unwrap({ errors, data }) {
        if (!errors || errors.length === 0) {
            return data;
        }
        throw errors[0];
    }

    async start(selectedArea, timeout = 1e3) {
        this.entertainmentArea = selectedArea;
        this.abortionController = new AbortController();
        await this.updateEntertainmentArea(selectedArea.id, { action: "start" });
        this.socket = _nodeDtlsClient.dtls.createSocket({
            timeout,
            port: 2100,
            type: "udp4",
            address: this.url,
            signal: this.abortionController.signal,
            cipherSuites: ["TLS_PSK_WITH_AES_128_GCM_SHA256"],
            psk: {
                [this.credentials.username]: Buffer.from(
                    this.credentials.clientkey,
                    "hex"
                ),
            },
        });
        return new Promise((resolve) => this.socket.on("connected", resolve));
    }

    stop() {
        if (!this.socket) {
            throw new Error("No active datagram socket!");
        }
        const id = this.entertainmentArea.id;
        this.socket.on("close", () => {
            this.updateEntertainmentArea(id, { action: "stop" });
        });
        this.abortionController.abort();
        this.entertainmentArea = null;
        this.abortionController = null;
        this.socket = null;
    }

    transition(colors) {
        if (!this.socket) {
            throw new Error("No active datagram socket!");
        }
        const protocol = Buffer.from("HueStream");
        const version = Buffer.from([2, 0]);
        const sequenceNumber = Buffer.from([0]);
        const reservedSpaces = Buffer.from([0, 0]);
        const colorMode = Buffer.from([0]);
        const reservedSpace = Buffer.from([0]);
        const groupId = Buffer.from(this.entertainmentArea.id);
        const rgbChannels = colors.map((rgb, channelIndex) => {
            return Buffer.from([
                channelIndex,
                rgb[0],
                rgb[0],
                rgb[1],
                rgb[1],
                rgb[2],
                rgb[2],
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

    async addScene(data) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/scene`,
            { body: data, method: "POST" }
        );
        return this._unwrap(response)[0];
    }
    async addRoom(data) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/room`,
            { method: "POST", body: data }
        );
        return this._unwrap(response)[0];
    }
    async addZone(data) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/zone`,
            { method: "POST", body: data }
        );
        return this._unwrap(response)[0];
    }
    async addEntertainmentArea(data) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/entertainment_configuration`,
            { method: "POST", body: data }
        );
        return this._unwrap(response)[0];
    }
    async addGeoFenceClient(data) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/geofence_client`,
            { method: "POST", body: data }
        );
        return this._unwrap(response)[0];
    }
    async addBehaviorInstance(data) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/behavior_instance`,
            { method: "POST", body: data }
        );
        return this._unwrap(response)[0];
    }
    getInfo() {
        return this._request(`https://${this.id}/api/0/config`);
    }
    async getLights() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/light`
        );
        return this._unwrap(response);
    }
    async getLight(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/light/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getLightGroups() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/grouped_light`
        );
        return this._unwrap(response);
    }
    async getLightGroup(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/grouped_light/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getScenes() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/scene`
        );
        return this._unwrap(response);
    }
    async getScene(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/scene/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getRooms() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/room`
        );
        return this._unwrap(response);
    }
    async getRoom(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/room/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getZones() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/zone`
        );
        return this._unwrap(response);
    }
    async getZone(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/zone/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getEntertainmentAreas() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/entertainment_configuration`
        );
        return this._unwrap(response);
    }
    async getEntertainmentArea(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/entertainment_configuration/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getHomeAreas() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/bridge_home`
        );
        return this._unwrap(response);
    }
    async getHomeArea(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/bridge_home/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getDevices() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/device`
        );
        return this._unwrap(response);
    }
    async getDevice(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/device/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getAllGeoFenceClients() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/geofence_client`
        );
        return this._unwrap(response);
    }
    async getGeoFenceClient(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/geofence_client/${id}`
        );
        return this._unwrap(response)[0];
    }
    async getAllBehaviorInstances() {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/behavior_instance`
        );
        return this._unwrap(response);
    }
    async getBehaviorInstance(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/behavior_instance/${id}`
        );
        return this._unwrap(response)[0];
    }
    async updateEntertainmentArea(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/entertainment_configuration/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateLight(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/light/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateScene(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/scene/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateRoom(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/room/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateZone(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/zone/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateHomeArea(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/bridge_home/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateLightGroup(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/grouped_light/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateDevice(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/device/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateBehaviorInstance(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/behavior_instance/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async updateGeoFenceClient(id, updates) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/geofecne_client/${id}`,
            { method: "PUT", body: updates }
        );
        return this._unwrap(response)[0];
    }
    async removeScene(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/scene/${id}`,
            { method: "DELETE" }
        );
        return this._unwrap(response)[0];
    }
    async removeRoom(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/room/${id}`,
            { method: "DELETE" }
        );
        return this._unwrap(response)[0];
    }
    async removeZone(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/zone/${id}`,
            { method: "DELETE" }
        );
        return this._unwrap(response)[0];
    }
    async removeBehaviorInstance(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/behavior_instance/${id}`,
            { method: "DELETE" }
        );
        return this._unwrap(response)[0];
    }
    async removeGeoFenceClient(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/geofence_client/${id}`,
            { method: "DELETE" }
        );
        return this._unwrap(response)[0];
    }
    async removeEntertainmentArea(id) {
        const response = await this._request(
            `https://${this.id}/clip/v2/resource/entertainment_configuration/${id}`,
            { method: "DELETE" }
        );
        return this._unwrap(response)[0];
    }
    constructor(initial) {
        this.id = null;
        this.url = null;
        this.socket = null;
        this.abortionController = null;
        this.entertainmentArea = null;
        this.credentials = null;
        this.id = initial.id;
        this.url = initial.url;
        this.credentials = initial.credentials;
        this.agent = createAgent(this.id, this.url);
    }
}
exports.default = HueBridge;