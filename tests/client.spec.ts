import { Client, HomerunnerError } from '../src/client';

describe('Client', () => {
    const OLD_ENV = process.env;

    beforeEach(() => {
        process.env = { ...OLD_ENV }; // Make a copy
    });

    afterAll(() => {
        process.env = OLD_ENV; // Restore old environment
    });

    it('should handle base paths with a trailing slash', () => {
        expect(new Client('http://example.com/').baseUrl).toEqual('http://example.com');
        expect(new Client('http://example.com/foo/bar/').baseUrl).toEqual('http://example.com/foo/bar');
    });

    it('should use the HOMERUNNER_URL env', () => {
        process.env.HOMERUNNER_URL = 'https://test-example.com';
        expect(new Client().baseUrl).toEqual('https://test-example.com');
    });

    it('should use the HOMERUNNER_PORT env, if HOMERUNNER_URL is not defined', () => {
        process.env.HOMERUNNER_PORT = '1337';
        expect(new Client().baseUrl).toEqual('http://localhost:1337');
    });

    it('should fall back to the default URL', () => {
        expect(new Client().baseUrl).toEqual('http://localhost:54321');
    });

    it('should be able to create a blueprint with a blueprint name', async () => {
        const client = new Client(undefined, async (input: RequestInfo, init?: RequestInit) => {
            expect(input).toBe('http://localhost:54321/create');
            expect(init?.headers).toEqual({
                'Content-Type': 'application/json',
            });
            expect(init?.body).toEqual('{"blueprint_name":"my_blueprint"}');
            console.log(input, init);
            return {
                json: async () => ({ testResponse: true }),
                status: 200,
            } as Response;
        });
        expect(await client.create('my_blueprint')).toEqual({ testResponse: true });
    });

    it('should be able to create a blueprint with a base_image_uri and blueprint_name', async () => {
        const client = new Client(undefined, async (input: RequestInfo, init?: RequestInit) => {
            expect(input).toBe('http://localhost:54321/create');
            expect(init?.headers).toEqual({
                'Content-Type': 'application/json',
            });
            expect(init?.body).toEqual('{"blueprint_name":"my_blueprint","base_image_uri":"my_base_image"}');
            console.log(input, init);
            return {
                json: async () => ({ testResponse: true }),
                status: 200,
            } as Response;
        });
        expect(await client.create({
            blueprint_name: 'my_blueprint',
            base_image_uri: 'my_base_image',
        })).toEqual({ testResponse: true });
    });

    it('should be able to create a blueprint with a base_image_uri and custom blueprint', async () => {
        const body = {
            base_image_uri: 'my_base_image',
            blueprint: {
                Name: 'foo',
                Homeservers: [{
                    Name: 'homeserver',
                }],
            },
        };
        const client = new Client(undefined, async (input: RequestInfo, init?: RequestInit) => {
            expect(input).toBe('http://localhost:54321/create');
            expect(init?.headers).toEqual({
                'Content-Type': 'application/json',
            });
            expect(JSON.parse(init?.body as string)).toEqual(body);
            console.log(input, init);
            return {
                json: async () => ({ testResponse: true }),
                status: 200,
            } as Response;
        });
        expect(await client.create(body)).toEqual({ testResponse: true });
    });

    it('should be able to destroy a blueprint', async () => {
        const client = new Client(undefined, async (input: RequestInfo, init?: RequestInit) => {
            expect(input).toBe('http://localhost:54321/destroy');
            expect(init?.headers).toEqual({
                'Content-Type': 'application/json',
            });
            expect(init?.body).toEqual('{"blueprint_name":"my_blueprint"}');
            console.log(input, init);
            return {
                json: async () => ({ }),
                status: 200,
            } as Response;
        });
        await client.destroy('my_blueprint');
    });

    it('should raise errors appropriately', async () => {
        const client = new Client(undefined, async (input: RequestInfo, init?: RequestInit) => {
            return {
                text: async () => 'an error',
                status: 401,
            } as Response;
        });
        try {
            await client.create('foo');
            fail('Expected to throw');
        } catch (ex) {
            if (ex instanceof HomerunnerError) {
                expect(ex.message).toEqual('Encountered an error while processing a homerunner request: 401 an error');
            } else {
                throw ex;
            }
        }

        try {
            await client.destroy('foo');
            fail('Expected to throw');
        } catch (ex) {
            if (ex instanceof HomerunnerError) {
                expect(ex.message).toEqual('Encountered an error while processing a homerunner request: 401 an error');
            } else {
                throw ex;
            }
        }
    });
});
