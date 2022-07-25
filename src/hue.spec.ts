import fetchMock from "jest-fetch-mock";
import mdnsMock from "./__mocks__/node-dns-sd";
import HueBridge from "./hue";
import {
  Light,
  BridgeConfig,
  ResourceNode,
  EntertainmentArea,
  HueBridgeNetworkDevice,
  BridgeClientCredentials,
  Scene,
  Room,
  Zone,
  GeoFenceClient,
  BehaviourInstance,
  LightGroup,
  Device,
  HomeArea,
} from "./hue.types";

// Mocks

fetchMock.enableMocks();

const mockID = "foo-bar";
const mockIp = "1.2.3.4";
const mockCredentials: BridgeClientCredentials = {
  username: "foo",
  clientkey: "bar",
};
const justGreen: [number, number, number] = [0, 255, 0];
const mockResourceNode: ResourceNode = { rid: "foo", rtype: "_test" };

const mockLight: Light = {
  alert: { action_values: ["test"] },
  color: {
    gamut: {
      blue: { x: 1, y: 2 },
      green: { x: 3, y: 4 },
      red: { x: 5, y: 6 },
    },
    gamut_type: "test",
    xy: { x: 1, y: 2 },
  },
  color_temperature: {
    mirek: 1,
    mirek_schema: { mirek_maximum: 10, mirek_minimum: 0 },
    mirek_valid: true,
  },
  dimming: {
    brightness: 1,
    min_dim_level: 0,
  },
  dynamics: {
    speed: 1,
    speed_valid: true,
    status: "foo",
    status_values: ["foo", "bar"],
  },
  effects: {
    effect_values: ["foo", "bar"],
    status: "baz",
    status_values: ["baz", "bar", "foo"],
  },
  gradient: {
    points: [{ color: { xy: { x: 1, y: 2 } } }],
    points_capable: 1,
  },
  id: "test",
  id_v1: "test",
  metadata: { archetype: "test", name: "foobar" },
  mode: "test",
  on: { on: true },
  owner: mockResourceNode,
  type: "test",
};

const secondMockLight: Light = {
  alert: { action_values: ["test"] },
  color: {
    gamut: {
      blue: { x: 1, y: 2 },
      green: { x: 3, y: 4 },
      red: { x: 5, y: 6 },
    },
    gamut_type: "test",
    xy: { x: 1, y: 2 },
  },
  color_temperature: {
    mirek: 1,
    mirek_schema: { mirek_maximum: 10, mirek_minimum: 0 },
    mirek_valid: true,
  },
  dimming: {
    brightness: 1,
    min_dim_level: 0,
  },
  dynamics: {
    speed: 1,
    speed_valid: true,
    status: "foo",
    status_values: ["foo", "bar"],
  },
  effects: {
    effect_values: ["foo", "bar"],
    status: "baz",
    status_values: ["baz", "bar", "foo"],
  },
  gradient: {
    points: [{ color: { xy: { x: 1, y: 2 } } }],
    points_capable: 1,
  },
  id: "test2",
  id_v1: "test2",
  metadata: { archetype: "test", name: "foobar" },
  mode: "test",
  on: { on: true },
  owner: mockResourceNode,
  type: "test",
};

const mockLightGroup: LightGroup = {
  id: "foo",
  type: "test",
  on: { on: true },
  alert: {
    action_values: ["test"],
  },
};

const mockLightGroup2: LightGroup = {
  id: "bar",
  type: "baz",
  on: { on: false },
  alert: {
    action_values: ["test"],
  },
};

const mockScene: Scene = {
  id: "foo",
  type: "test",
  group: mockResourceNode,
  metadata: {
    name: "bar",
  },
  actions: [
    {
      target: mockResourceNode,
      action: {
        on: {
          on: true,
        },
      },
    },
  ],
  palette: {
    color: { x: 1, y: 0 },
    dimming: { brightness: 100 },
    color_temperature: [{ color_temperature: { mirek: 300 } }],
  },
};

const mockRoom: Room = {
  id: "bar",
  type: "test",
  children: [mockResourceNode],
  grouped_services: [mockResourceNode],
  metadata: { archetype: "test", name: "foo" },
  services: [mockResourceNode],
};

const mockZone: Zone = {
  id: "bar",
  type: "test",
  services: [mockResourceNode],
  grouped_services: [mockResourceNode],
  children: [mockResourceNode],
  metadata: {
    name: "foo",
  },
};

const mockHomeArea: HomeArea = {
  children: [mockResourceNode],
  grouped_services: [mockResourceNode],
  id: "foobar",
  services: [mockResourceNode],
  type: "test",
};

const mockEntertainmentArea: EntertainmentArea = {
  channels: [
    {
      channel_id: 0,
      position: [
        {
          x: 1,
          y: 2,
          z: 3,
        },
        {
          x: 4,
          y: 5,
          z: 6,
        },
      ],
      members: [
        {
          index: 0,
          service: mockResourceNode,
        },
      ],
    },
  ],
  configuration_type: "test",
  id: "test",
  id_v1: "test",
  light_services: [mockResourceNode],
  locations: {
    service_locations: [
      {
        position: {
          x: 1,
          y: 2,
          z: 3,
        },
        positions: [
          {
            x: 1,
            y: 2,
            z: 3,
          },
          {
            x: 4,
            y: 5,
            z: 6,
          },
        ],
        service: mockResourceNode,
      },
    ],
  },
  metadata: { name: "test" },
  name: "test",
  status: "test",
  stream_proxy: {
    mode: "test",
    node: mockResourceNode,
  },
  type: "test",
};

const mockGeoFenceClient: GeoFenceClient = {
  id: "baz",
  type: "test",
  name: "foo",
  is_at_home: false,
};

const mockBehaviorInstance: BehaviourInstance = {
  id: "bar",
  type: "test",
  script_id: "foo",
  enabled: true,
  state: {},
  configuration: {},
  last_error: "",
  migrated_from: "",
  metadata: { name: "baz" },
  status: "initializing",
  dependees: [
    {
      type: "test",
      target: mockResourceNode,
      level: "non_critical",
    },
  ],
};

const mockDevice: Device = {
  id: "bar",
  type: "test",
  services: [mockResourceNode],
  metadata: { name: "foo" },
  product_data: {
    certified: true,
    manufacturer_name: "acme",
    model_id: "baz",
    product_name: "test",
    software_version: "0.0.0",
    product_archetype: "",
  },
};

const mockDevice2: Device = {
  id: "foo",
  type: "test",
  services: [mockResourceNode],
  metadata: { name: "baz" },
  product_data: {
    certified: true,
    manufacturer_name: "acme",
    model_id: "baz",
    product_name: "test",
    software_version: "0.0.0",
    product_archetype: "",
  },
};

describe("Hue-Sync", () => {
  afterEach(() => {
    fetchMock.resetMocks();
  });

  describe("static methods", () => {
    const mockBridgeNetworkDevice: HueBridgeNetworkDevice = {
      id: "foo",
      port: 123,
      internalipaddress: "bar",
    };

    it("should be able to discover Hue Bridge devices via mDNS", async () => {
      mdnsMock.discover.mockReturnValueOnce([
        {
          address: mockBridgeNetworkDevice.internalipaddress,
          service: {
            port: mockBridgeNetworkDevice.port,
          },
          packet: {
            additionals: [
              {
                rdata: { bridgeid: mockBridgeNetworkDevice.id },
              },
            ],
          },
        },
      ]);

      const [bridgeOnNetwork] = await HueBridge.discover();

      expect(bridgeOnNetwork).toEqual(mockBridgeNetworkDevice);
      expect(mdnsMock.discover.mock.calls.length).toBe(1);
    });

    it("should be able to discover Hue Bridge devices via remote API", async () => {
      const mockBridgeNetworkDevice: HueBridgeNetworkDevice = {
        id: "foo",
        port: 123,
        internalipaddress: "bar",
      };
      mdnsMock.discover.mockRejectedValueOnce(null);
      fetchMock.mockOnce(JSON.stringify([mockBridgeNetworkDevice]));

      const [bridgeOnNetwork] = await HueBridge.discover();

      expect(bridgeOnNetwork).toEqual(mockBridgeNetworkDevice);
    });

    it("should be able to register hue-sync on Hue Bridge device", async () => {
      fetchMock.mockOnce(JSON.stringify([{ success: mockCredentials }]));

      const credentials = await HueBridge.register(mockIp);

      expect(credentials).toEqual(mockCredentials);
    });
  });

  describe("instance methods", () => {
    let bridge = new HueBridge({
      id: mockID,
      url: mockIp,
      credentials: mockCredentials,
    });

    describe("Create Methods", () => {
      it("should be able to add an Entertainment Area", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockEntertainmentArea] }));

        const result = await bridge.addEntertainmentArea({
          metadata: {
            name: "test",
          },
          configuration_type: "test",
          locations: {
            service_locations: [
              {
                service: mockResourceNode,
                position: { x: 1, y: 2, z: 3 },
                positions: [
                  { x: 1, y: 2, z: 3 },
                  { x: 4, y: 5, z: 6 },
                ],
              },
            ],
          },
        });

        expect(result).toEqual(mockEntertainmentArea);
      });

      it("should be able to add a new Scene", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockScene] }));

        const result = await bridge.addScene({
          metadata: {
            name: "bar",
          },
          group: mockResourceNode,
          actions: [
            {
              target: mockResourceNode,
              action: { on: { on: true } },
            },
          ],
        });

        expect(result).toEqual(mockScene);
      });

      it("should be able to add a new Room", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockRoom] }));

        const result = await bridge.addRoom({
          metadata: {
            name: "foo",
          },
          children: [mockResourceNode],
        });

        expect(result).toEqual(mockRoom);
      });

      it("should be able to add a new Zone", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockZone] }));

        const result = await bridge.addZone({
          children: [mockResourceNode],
          metadata: {
            name: "foo",
          },
        });

        expect(result).toEqual(mockZone);
      });

      it("should be able to add a new Geo Fence Client", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockGeoFenceClient] }));

        const result = await bridge.addGeoFenceClient({
          name: "foo",
          type: "test",
          is_at_home: false,
        });

        expect(result).toEqual(mockGeoFenceClient);
      });

      it("should be able to add a new Behavior Instance", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockBehaviorInstance] }));

        const result = await bridge.addBehaviorInstance({
          enabled: true,
          script_id: "test",
          type: "test",
          metadata: { name: "baz" },
          configuration: {},
        });

        expect(result).toEqual(mockBehaviorInstance);
      });
    });

    describe("Read Methods", () => {
      beforeEach(() => {
        bridge = new HueBridge({
          id: mockID,
          url: mockIp,
          credentials: mockCredentials,
        });
        fetchMock.resetMocks();
      });

      it("should get all Lights", async () => {
        fetchMock.mockOnce(
          JSON.stringify({
            data: [mockLight, secondMockLight],
          })
        );

        const result = await bridge.getLights();

        expect(result.length).toBe(2);
        expect(result[0].id).toEqual(mockLight.id);
        expect(result[1].id).toEqual(secondMockLight.id);
      });

      it("should get all Light Groups", async () => {
        fetchMock.mockOnce(
          JSON.stringify({
            data: [mockLightGroup, mockLightGroup2],
          })
        );

        const result = await bridge.getLightGroups();

        expect(result.length).toBe(2);
        expect(result[0].id).toEqual(mockLightGroup.id);
        expect(result[1].id).toEqual(mockLightGroup2.id);
      });

      it("should be able to retrieve all Scenes", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockScene, mockScene] }));

        const result = await bridge.getScenes();

        expect(result.length).toBe(2);
        expect(result[0]).toEqual(mockScene);
      });

      it("should be able to retrieve all Rooms", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockRoom, mockRoom] }));

        const result = await bridge.getRooms();

        expect(result.length).toBe(2);
        expect(result[0]).toEqual(mockRoom);
      });

      it("should be able to retrieve all Zones", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockZone, mockZone] }));

        const result = await bridge.getZones();

        expect(result.length).toBe(2);
        expect(result[0]).toEqual(mockZone);
      });

      it("should get all the Home Areas", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockHomeArea] }));

        const result = await bridge.getHomeAreas();

        expect(result.length).toBe(1);
        expect(result[0]).toEqual(mockHomeArea);
      });

      it("should get all the Entertainment Areas", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockEntertainmentArea] }));

        const result = await bridge.getEntertainmentAreas();

        expect(result.length).toBe(1);
        expect(result[0]).toEqual(mockEntertainmentArea);
      });

      it("should be able to retrieve All Geo Fence Clients", async () => {
        fetchMock.mockOnce(
          JSON.stringify({ data: [mockGeoFenceClient, mockGeoFenceClient] })
        );

        const result = await bridge.getAllGeoFenceClients();

        expect(result.length).toBe(2);
        expect(result[0]).toEqual(mockGeoFenceClient);
      });

      it("should be able to retrieve All Behavior Instances", async () => {
        fetchMock.mockOnce(
          JSON.stringify({ data: [mockBehaviorInstance, mockBehaviorInstance] })
        );

        const result = await bridge.getAllBehaviorInstances();

        expect(result.length).toBe(2);
        expect(result[0]).toEqual(mockBehaviorInstance);
      });

      it("should get all registered Devices", async () => {
        fetchMock.mockOnce(
          JSON.stringify({
            data: [mockDevice, mockDevice2],
          })
        );

        const result = await bridge.getDevices();

        expect(result.length).toBe(2);
        expect(result[0].id).toEqual(mockDevice.id);
        expect(result[1].id).toEqual(mockDevice2.id);
      });

      // individuals

      it("should be able to retrieve Hue Bridge config information", async () => {
        const mockConfig: BridgeConfig = {
          name: "foo",
          datastoreversion: "bar",
          swversion: "baz",
          apiversion: "lorem",
          mac: "ipsum",
          bridgeid: "dolor",
          factorynew: false,
          replacesbridgeid: "amet",
          modelid: "consecutir",
          starterkitid: "dolor",
        };

        fetchMock.mockOnce(JSON.stringify(mockConfig));

        const config = await bridge.getInfo();

        expect(config).toEqual(mockConfig);
      });

      it("should get a specific Light", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockLight] }));

        const result = await bridge.getLight(mockLight.id);

        expect(result).toEqual(mockLight);
      });

      it("should get a specific Light Group", async () => {
        fetchMock.mockOnce(
          JSON.stringify({
            data: [mockLightGroup],
          })
        );

        const result = await bridge.getLightGroup(mockLightGroup.id);

        expect(result).toEqual(mockLightGroup);
      });

      it("should be able to retrieve a specific Scene", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockScene] }));

        const result = await bridge.getScene(mockScene.id);

        expect(result).toEqual(mockScene);
      });

      it("should be able to retrieve a specific Room", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockRoom] }));

        const result = await bridge.getRoom(mockRoom.id);

        expect(result).toEqual(mockRoom);
      });

      it("should be able to retrieve a specific Zone", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockZone] }));

        const result = await bridge.getZone(mockZone.id);

        expect(result).toEqual(mockZone);
      });

      it("should get a specific Home Area", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockHomeArea] }));

        const result = await bridge.getHomeArea(mockHomeArea.id);

        expect(result).toEqual(mockHomeArea);
      });

      it("should get a specific Entertainment Area", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockEntertainmentArea] }));

        const result = await bridge.getEntertainmentArea(
          mockEntertainmentArea.id
        );

        expect(result).toEqual(mockEntertainmentArea);
      });

      it("should be able to retrieve a specific Geo Fence Client", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockGeoFenceClient] }));

        const result = await bridge.getGeoFenceClient(mockGeoFenceClient.id);

        expect(result).toEqual(mockGeoFenceClient);
      });

      it("should be able to retrieve a specific Behavior Instance", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockBehaviorInstance] }));

        const result = await bridge.getBehaviorInstance(
          mockBehaviorInstance.id
        );

        expect(result).toEqual(mockBehaviorInstance);
      });

      it("should get a specific registered Device", async () => {
        fetchMock.mockOnce(
          JSON.stringify({
            data: [mockDevice],
          })
        );

        const result = await bridge.getDevice(mockDevice.id);

        expect(result).toEqual(mockDevice);
      });
    });

    describe("Update Methods", () => {
      beforeEach(() => {
        bridge = new HueBridge({
          id: mockID,
          url: mockIp,
          credentials: mockCredentials,
        });
        fetchMock.resetMocks();
      });

      it("should update a given entertainment area", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const result = await bridge.updateEntertainmentArea(
          mockEntertainmentArea.id,
          {
            action: "stop",
          }
        );

        expect(result).toEqual(mockResourceNode);
      });

      it("should update a single light", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const result = await bridge.updateLight(mockLight.id, {
          on: { on: true },
        });

        expect(result).toEqual(mockResourceNode);
      });
    });

    describe("Delete Methods", () => {
      it("should be able to remove a Scene by ID", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const actualResult = await bridge.removeScene(mockResourceNode.rid);

        expect(actualResult).toEqual(mockResourceNode);
      });
      it("should be able to remove a Room by ID", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const actualResult = await bridge.removeRoom(mockResourceNode.rid);

        expect(actualResult).toEqual(mockResourceNode);
      });
      it("should be able to remove a Zone by ID", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const actualResult = await bridge.removeZone(mockResourceNode.rid);

        expect(actualResult).toEqual(mockResourceNode);
      });
      it("should be able to remove an Entertainment Area by ID", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const actualResult = await bridge.removeEntertainmentArea(
          mockResourceNode.rid
        );

        expect(actualResult).toEqual(mockResourceNode);
      });
      it("should be able to remove a Geo Fence Client by ID", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const actualResult = await bridge.removeGeoFenceClient(
          mockResourceNode.rid
        );

        expect(actualResult).toEqual(mockResourceNode);
      });
      it("should be able to remove a Behavior Instance by ID", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        const actualResult = await bridge.removeBehaviorInstance(
          mockResourceNode.rid
        );

        expect(actualResult).toEqual(mockResourceNode);
      });
    });

    describe("Streaming Entertainment API", () => {
      it("should throw when calling stop with no active channel", () => {
        try {
          bridge.stop();
        } catch (e) {
          expect(e.message).toBe("No active datagram socket!");
        }
      });

      it("should throw when calling transition with no active channel", async () => {
        try {
          await bridge.transition([justGreen]);
        } catch (e) {
          expect(e.message).toBe("No active datagram socket!");
        }
      });

      it("should setup a dgram channel for a given entertainment area", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockEntertainmentArea] }));

        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));

        await bridge.start(mockEntertainmentArea);
        // @ts-ignore
        expect(bridge.socket).toBeDefined();
      });

      it("should be able to transmit an RGB array through Hue Entertainment API", async () => {
        await bridge.transition([justGreen]);
        // @ts-ignore
        expect(bridge.socket.send.mock.calls.length).toBe(1);
        // @ts-ignore
        expect(bridge.socket.send.mock.calls[0][0]).toBeInstanceOf(Buffer);
      });

      it("should be able to close the dgram channel for an active entertainment area", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockResourceNode] }));
        const abortSpy = jest.spyOn(AbortController.prototype, "abort");

        await bridge.stop();

        expect(abortSpy.mock.calls.length).toBe(1);
      });
    });
  });
});
