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
} from "./hue.types";

fetchMock.enableMocks();

describe("hue-sync", () => {
  const mockID = "foo-bar";
  const mockIp = "1.2.3.4";
  const mockCredentials: BridgeClientCredentials = {
    username: "foo",
    clientkey: "bar",
  };

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

    describe("Read Methods", () => {
      beforeEach(() => {
        bridge = new HueBridge({
          id: mockID,
          url: mockIp,
          credentials: mockCredentials,
        });
        fetchMock.resetMocks();
      });

      it("should get the Entertainment Areas registered on Hue Bridge", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockEntertainmentArea] }));

        const result = await bridge.getEntertainmentAreas();

        expect(result.length).toBe(1);
        expect(result[0]).toEqual(mockEntertainmentArea);
      });

      it("should get a specific Entertainment Areas registered on Hue Bridge", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockEntertainmentArea] }));

        const result = await bridge.getEntertainmentArea(
          mockEntertainmentArea.id
        );

        expect(result).toEqual(mockEntertainmentArea);
      });

      it("should get the lights registered on Hue Bridge", async () => {
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

      it("should get a specific Light registered on Hue Bridge", async () => {
        fetchMock.mockOnce(JSON.stringify({ data: [mockLight] }));

        const result = await bridge.getLight(mockLight.id);

        expect(result).toEqual(mockLight);
      });

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
