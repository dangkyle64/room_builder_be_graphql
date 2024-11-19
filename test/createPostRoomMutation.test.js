const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon  = require('sinon');

const createRoomResolver = require('../src/postRoom/postMutations/createPostRoom');
const postRoomServices = require('../src/postRoom/postRoomServices');

// mock room injection
sinon.stub(postRoomServices, 'createPostRoom').callsFake(async (args) => {
    return {
        id: args.id,
        length: args.length,
        width: args.width,
        height: args.height
    }
});

const typeDefs = gql`
    type Room {
        id: ID!
        length: Float!
        width: Float!
        height: Float!
    }

    type Query {
        _empty: String
    }

    type Mutation {
        createPostRoom(id: ID!, length: Float!, width: Float!, height: Float!): Room!
    }
`;

const resolvers = createRoomResolver;

let app;
let testServer;
let httpServer;

beforeEach(async () => {
    app = express();
    testServer = new ApolloServer({ 
        typeDefs, 
        resolvers,
    });

    await testServer.start()
    testServer.applyMiddleware({ app });

    httpServer = app.listen(4003, () => console.log('Server running on http://localhost:4003/graphql'));
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

describe('createPostRoom mutation', () => {
    test('should create a room and return correct room data', async () => {
        const createRoomValidMutation = `
            mutation {
                createPostRoom(id: 123, length: 5.55, width: 15.99, height: 25.001) {
                    id
                    length
                    width
                    height
                }
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: createRoomValidMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if mutation returns correct room data 
            assert.strictEqual(response.body.data.createPostRoom.id, '123');
            assert.strictEqual(response.body.data.createPostRoom.length, 5.55);
            assert.strictEqual(response.body.data.createPostRoom.width, 15.99);
            assert.strictEqual(response.body.data.createPostRoom.height, 25.001);

            // check if service was called
            assert.strictEqual(postRoomServices.createPostRoom.calledOnce, true);

    });

    test('should throw error if dimensions are negative', async () => {
        const createRoomInvalidMutation = `
            mutation {
                createPostRoom(id: 123, length: -5, width: -15, height: -25) {
                    id
                    length
                    width
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createRoomInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(200); // graphQL always returns 200 OK even on errors, check error message

        assert.strictEqual(response.body.errors[0].message, 'Dimensions have to be greater than 0');
    });

    test('should throw error if dimensions are higher than maximum', async () => {
        const createRoomInvalidMutation = `
            mutation {
                createPostRoom(id: 123, length: 105, width: 15.21, height: 25) {
                    id
                    length
                    width
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createRoomInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(200); // graphQL always returns 200 OK even on errors, check error message

        assert.strictEqual(response.body.errors[0].message, 'Dimensions have to be less than 100');
    });

    test('should throw error if measurements is not an integer or float', async () => {
        const createRoomInvalidMutation = `
            mutation {
                createPostRoom(id: 123, length: apple, width: 15.21, height: 25) {
                    id
                    length
                    width
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createRoomInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(400); // graphQL will return a 400 if it fails on the query

        assert.strictEqual(response.body.errors[0].message, 'Float cannot represent non numeric value: apple');
    });

    test('should throw error if measurements has a null', async () => {
        const createRoomInvalidMutation = `
            mutation {
                createPostRoom(id: 123, length: 12, width: 15.21) {
                    id
                    length
                    width
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: createRoomInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(400); // graphQL will return a 400 if it fails on the query

        assert.strictEqual(response.body.errors[0].message, 'Field "createPostRoom" argument "height" of type "Float!" is required, but it was not provided.');
    });

});