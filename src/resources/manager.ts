/**
 * Generic resource manager for CRUD operations
 */

import type { JSONResponse, ResourceNode, RequestOptions } from "../common/types";
import type { ResourceEndpointKey, ResourceTypeMap } from "./endpoints";
import { RESOURCE_ENDPOINTS } from "./endpoints";
import { HueBridgeApiError } from "../errors";

/**
 * Internal request function type
 */
type RequestFn = <T extends {}>(
  endpoint: string,
  options?: RequestOptions
) => Promise<T>;

/**
 * Unwraps a JSONResponse, throwing an error if the response contains errors
 */
function unwrap<T extends {}>(response: JSONResponse<T>): T {
  if (!response.errors || response.errors.length === 0) {
    return response.data;
  }

  const errorMessage = response.errors.map((e) => e.message || String(e)).join("; ");
  throw new HueBridgeApiError(
    `Hue Bridge API error: ${errorMessage}`,
    response.errors
  );
}

/**
 * Resource manager providing generic CRUD operations for Hue resources
 */
export class ResourceManager {
  constructor(
    private readonly bridgeId: string,
    private readonly request: RequestFn
  ) {}

  /**
   * Get all resources of a specific type
   */
  async getResources<K extends ResourceEndpointKey>(
    resourceType: K
  ): Promise<ResourceTypeMap[K][]> {
    const endpoint = RESOURCE_ENDPOINTS[resourceType];
    const response = await this.request<JSONResponse<ResourceTypeMap[K][]>>(
      `https://${this.bridgeId}/clip/v2/resource/${endpoint}`
    );
    return unwrap(response);
  }

  /**
   * Get a specific resource by ID
   */
  async getResource<K extends ResourceEndpointKey>(
    resourceType: K,
    id: string
  ): Promise<ResourceTypeMap[K]> {
    const endpoint = RESOURCE_ENDPOINTS[resourceType];
    const response = await this.request<JSONResponse<ResourceTypeMap[K][]>>(
      `https://${this.bridgeId}/clip/v2/resource/${endpoint}/${id}`
    );
    return unwrap(response)[0];
  }

  /**
   * Update a resource
   */
  async updateResource<K extends ResourceEndpointKey>(
    resourceType: K,
    id: string,
    updates: Partial<ResourceTypeMap[K]>
  ): Promise<ResourceNode> {
    const endpoint = RESOURCE_ENDPOINTS[resourceType];
    const response = await this.request<JSONResponse<ResourceNode[]>>(
      `https://${this.bridgeId}/clip/v2/resource/${endpoint}/${id}`,
      { method: "PUT", body: updates }
    );
    return unwrap(response)[0];
  }

  /**
   * Delete a resource
   */
  async deleteResource<K extends ResourceEndpointKey>(
    resourceType: K,
    id: string
  ): Promise<ResourceNode> {
    const endpoint = RESOURCE_ENDPOINTS[resourceType];
    const response = await this.request<JSONResponse<ResourceNode[]>>(
      `https://${this.bridgeId}/clip/v2/resource/${endpoint}/${id}`,
      { method: "DELETE" }
    );
    return unwrap(response)[0];
  }

  /**
   * Add a new resource
   */
  async addResource<K extends ResourceEndpointKey>(
    resourceType: K,
    data: Partial<ResourceTypeMap[K]>
  ): Promise<ResourceNode> {
    const endpoint = RESOURCE_ENDPOINTS[resourceType];
    const response = await this.request<JSONResponse<ResourceNode[]>>(
      `https://${this.bridgeId}/clip/v2/resource/${endpoint}`,
      { method: "POST", body: data }
    );
    return unwrap(response)[0];
  }
}
