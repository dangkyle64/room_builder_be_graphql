const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon  = require('sinon');

const createRoomMutation = require('../src/postRoom/postMutations/createPostRoom');
const postRoomService = require('../src/postRoom/postRoomServices');

// mock room injection
sinon.stub(postRoomService, 'createPostRoom').callsFake(async (args) => {
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

const resolvers = createRoomMutation;


let app;
let testServer;
let httpServer;

beforeEach(async () => {
    app = express();
    testServer = new ApolloServer({ 
        typeDefs, 
        resolvers,
        formatError: (error) => {
            console.log("Error: ", error);
            return error;
        },
    });

    await testServer.start()
    testServer.applyMiddleware({ app });

    httpServer = app.listen(5000, () => console.log('Server running on http://localhost:5000/graphql'))
});

afterEach(async () => {
    httpServer.close();
});

describe('createPostRoom mutation', () => {
    test('should create a room and return correct room data', async () => {
        const createRoomTestMutation = `
            mutation {
                createPostRoom(id: 123, length: 5, width: 15, height: 25) {
                    id
                    length
                    width
                    height
                }
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: createRoomTestMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if mutation returns correct room data 
            assert.strictEqual(response.body.data.createPostRoom.id, '123');
            assert.strictEqual(response.body.data.createPostRoom.length, 5);
            assert.strictEqual(response.body.data.createPostRoom.width, 15);
            assert.strictEqual(response.body.data.createPostRoom.height, 25);

            // check if service was called
            assert.strictEqual(postRoomService.createPostRoom.calledOnce, true);

    });

    test('should throw error if dimensions are invalid', async () => {
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

});