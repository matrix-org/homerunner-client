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

interface Room {
	Ref?: string;
	Creator?: string;
	CreateRoom?: Record<string, unknown>;
	Events?: {
		Type: string;
		Sender: string;
		StateKey?: string;
	}[];
}

/**
 * A blueprint for creating a homeserver deployment.
 */
 export interface Blueprint {
	// The name of the blueprint. Containers will use this name.
	Name: string;
	// The list of homeservers to create for this deployment.
	Homeservers: {
		// The name of this homeserver. Containers will use this name.
		Name: string;
		// The list of users to create on this homeserver.
		Users?: {
			Localpart: string;
			DisplayName: string;
			AvatarURL?: string;
			AccountData?: {
				Key: string;
				Value: Record<string, unknown>;
			}[];
		}[];
		// The list of rooms to create on this homeserver
		Rooms?: (Room&{Ref: string}|Room&{Creator: string})[];
		// The list of application services to create on the homeserver
		ApplicationServices?: {
			ID: string;
			URL?: string;
			SenderLocalpart?: string;
			RateLimited?: boolean;
		}[];
	}[];
	// A set of user IDs to retain access_tokens for. If empty, all tokens are kept.
	KeepAccessTokensForUsers?: string[];
}