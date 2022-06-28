homerunner-client
=================

A JS library for interfacing with Complement's homerunner application.

See [matrix-org/complement](https://github.com/matrix-org/complement/tree/main/cmd/homerunner) for details
on how that works.

The library is environment variable aware, and will use the following URLs in order when communicating with homerunner:
1. The URL provided to `Homerunner.Client` in the constructor.
1. `HOMERUNNER_URL`, if provided as an environment variable.
2. `http://localhost:{process.env.HOMERUNNER_PORT}`, if `HOMERUNNER_PORT` is provided as an environment variable.
3. `http://localhost:54321`

## Usage

You can install the package with `npm install homerunner-client` or `yarn add homerunner-client`.

### Example

Below is a simple example of how to use the library. Consult the type definitions
for more advanced usage.

```typescript
const client = new Homerunner.Client();

const blueprint1 = await client.create("my-blueprint");
// or
const blueprint2 = await client.create({
	base_image_uri: "complement-dendrite",
	blueprint: {
		Name: "my-custom-blueprint",
		Homeservers: [{
			Name: "hs1",
			Users: [{
				Localpart: "alice",
				DisplayName: "Alice",
			}]
		}]
	}
});
// or
const blueprint3 = await client.create({
	base_image_uri: "complement-dendrite",
	blueprint_name: "federation_one_to_one_room"
})

// Do some testing....

await client.destroy("my-blueprint");
await client.destroy("my-custom-blueprint");
await client.destroy("federation_one_to_one_room");
```