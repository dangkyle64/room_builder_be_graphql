assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const createFurnitureResolver = require('../src/postFurniture/postMutations/createPostFurniture');
const postFurnitureServices = require('../src/postFurniture/postFurnitureServices');

sinon.stub(postFurnitureServices, 'createPostFurniture').callsFake(async (args) => {
    return {
        id: args.id,
        length: args.length,
        width: args.width,
        height: args.height,
        roomId: args.roomId,
    }
});

const typeDefs = gql`
    type Furniture {
        id: ID!
        length: Float!
        width: Float!
        height: Float!
        roomId: ID! 
    }

    type Query {
        _empty: String
    }

    type Mutation {
        createPostFurniture(id: ID!, length: Float!, width: Float!, height: Float!, roomId: ID!): Furniture!
    }
`;

const resolvers = createFurnitureResolver;

let app;
let testServer;
let httpServer;

beforeEach(async () => {
    app = express();
    testServer = new ApolloServer({
        typeDefs,
        resolvers
    });

    await testServer.start();
    testServer.applyMiddleware({ app });

    httpServer = app.listen(4009, () => console.log('Server running on http://localhost:4009/graphql'));
});

afterEach(async () => {
    //console.log("Shutting down server");

    //remove stub
    sinon.restore();

    //confirm server shuts down
    if (httpServer) {
        await new Promise(resolve => httpServer.close(resolve));
        //console.log('Server shut down');
    }
});

describe('createPostFurniture mutation', () => {
    test('it should create a furniture and return correct furniture data', async () => {
        const createFurnitureValidMutation = `
            mutation {
                createPostFurniture(id: 123, length: 2.55, width: 3.99, height: 2.001, roomId: 1) {
                    id
                    length
                    width
                    height
                    roomId
                }
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: createFurnitureValidMutation })
        .expect('Content-Type', /json/)
        .expect(200)

        // check if mutation returns correct furniture data 
            console.log('response body for createPostFurniture: ', response.body);
            assert.strictEqual(response.body.data.createPostFurniture.id, '123');
            assert.strictEqual(response.body.data.createPostFurniture.length, 2.55);
            assert.strictEqual(response.body.data.createPostFurniture.width, 3.99);
            assert.strictEqual(response.body.data.createPostFurniture.height, 2.001);
            assert.strictEqual(response.body.data.createPostFurniture.roomId, '1');

            // check if service was called
            assert.strictEqual(postFurnitureServices.createPostFurniture.calledOnce, true);
    });

    test('should throw error if dimensions are negative', async () => {
        const createFurnitureInvalidMutation = `
            mutation {
                createPostFurniture(id: 123, length: -5, width: -1, height: -2, roomId: 1) {
                    id
                    length
                    width
                    height
                    roomId
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createFurnitureInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(200); // graphQL always returns 200 OK even on errors, check error message

        assert.strictEqual(response.body.errors[0].message, 'Dimensions for the furniture have to be greater than 0');
    });

    test('should throw error if dimensions are higher than maximum', async () => {
        const createFurnitureInvalidMutation = `
            mutation {
                createPostFurniture(id: 123, length: 22.55, width: 32.99, height: 22.001, roomId: 1) {
                    id
                    length
                    width
                    height
                    roomId
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createFurnitureInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(200)

        assert.strictEqual(response.body.errors[0].message, 'Dimensions for the furniture have to be less than 5')
    });

    test('should throw error if measurements is not an integer or float', async () => {
        const createFurnitureInvalidMutation = `
            mutation {
                createPostFurniture(id: 123, length: apple, width: 1, height: 2, roomId: 1) {
                    id
                    length
                    width
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createFurnitureInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(400); // graphQL will return a 400 if it fails on the query

        assert.strictEqual(response.body.errors[0].message, 'Float cannot represent non numeric value: apple');
    });

    test('should throw error if measurements has a null', async () => {
        const createFurnitureInvalidMutation = `
            mutation {
                createPostFurniture(id: 123, length: 2, width: 5.21, roomId: 1) {
                    id
                    length
                    width
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createFurnitureInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(400); // graphQL will return a 400 if it fails on the query

        assert.strictEqual(response.body.errors[0].message, 'Field "createPostFurniture" argument "height" of type "Float!" is required, but it was not provided.');
    });

});
