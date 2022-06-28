/*
Copyright 2022 The Matrix.org Foundation C.I.C.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import { default as crossFetch } from 'cross-fetch';
import { Blueprint } from "./blueprint";

const platformFetch = global.fetch || crossFetch;

const DEFAULT_URL = process.env.HOMERUNNER_URL || `http://localhost:${process.env.HOMERUNNER_PORT || 54321}`

export namespace Homerunner {
	export interface Homeserver {
		BaseURL: string;
		FedBaseURL: string;
		ContainerID: string;
		AccessTokens: {[userId: string]: string};
		DeviceIDs: {[userId: string]: string};
		ApplicationServices: {[appserviceId: string]: string};
	}
	
	/**
	 * Options for a /create request if you have your own custom blueprint you want to run.
	 * 
	 * @see https://github.com/matrix-org/complement/blob/3af1311ef9e2d75ab29f2773719eddb826258e6d/cmd/homerunner/route_create.go#L13
	 */
	export interface CreateOptionsDynamicBlueprint {
		base_image_uri: string;
		blueprint: Blueprint;
	}
	
	/**
	 * This allows you to deploy any one of the static blueprints in https://github.com/matrix-org/complement/tree/master/internal/b
	 */
	export interface CreateOptionsStaticBlueprint {
		blueprint_name: string;
		base_image_uri: string;
	}
	
	/**
	 * Options for a /destroy request
	 * 
	 * @see https://github.com/matrix-org/complement/blob/3af1311ef9e2d75ab29f2773719eddb826258e6d/cmd/homerunner/route_destroy.go#L10
	 */
	export interface DestroyOptions {
		blueprint_name: string;
	}
	
	export interface CreateResponse {
		homeservers: {[homeserverId: string]: Homeserver};
		expires: string;
	}
	
	export class HomerunnerError extends Error {
		constructor(statusCode: number, body: string) {
			super(`Encountered an error while processing a homerunner request: ${statusCode} ${body}`);
		}
	}
	
	/**
	 * A client interface for Homerunner.
	 * @see https://github.com/matrix-org/complement/tree/main/cmd/homerunner
	 */
	export class Client {
		/**
		 * @param baseUrl The URL for homerunner's API endpoint. This will default to:
		 * - The `HOMERUNNER_URL` env var, if defined.
		 * - `http://localhost:${HOMERUNNER_PORT}`, if the HOMERUNNER_PORT env is defined.
		 * - `http://localhost:54321`
		 */
		constructor(private readonly baseUrl: string=DEFAULT_URL) {
			if (baseUrl.endsWith('/')) {
				this.baseUrl = baseUrl.slice(0,-1);
			}
		}
	
		
		/**
		 * Deploy a blueprint
		 * @param nameOrOptions Either a blueprint name that has been previously defined, or a in-line blueprint.
		 */
		async create(nameOrOptions: string|CreateOptionsDynamicBlueprint|CreateOptionsStaticBlueprint): Promise<CreateResponse> {
			const options = typeof nameOrOptions === "string" ? { blueprint_name: nameOrOptions } : nameOrOptions;
			const req = platformFetch(`${this.baseUrl}/create`, {
				method: "POST",
				body: JSON.stringify(options),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const result = await req;
			if (result.status !== 200) {
				throw new HomerunnerError(result.status, await result.text());
			}
			return result.json();
		}
	
		/**
		 * Destroy a blueprint
		 * @param blueprintName The name of the blueprint to destroy. 
		 */
		async destroy(blueprintName: string) {
			const req = platformFetch(`${this.baseUrl}/destroy`, {
				method: "POST",
				body: JSON.stringify({ blueprint_name: blueprintName }),
				headers: {
					'Content-Type': 'application/json',
				},
			});
			const result = await req;
			if (result.status !== 200) {
				throw new HomerunnerError(result.status, await result.text());
			}
		}
	}
}