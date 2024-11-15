const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const updateRoomMutation = require('../src/postRoom/postMutations/updatePostRoom');
const postRoomService = require('../src/postRoom/postRoomServices');

// mock room injection
sinon.stub(postRoomService, 'updatePostRoom').callsFake(async (args) => {
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
        updatePostRoom(id: ID!, length: Float!, width: Float!, height: Float!): Room!
    }
`;

const resolvers = updateRoomMutation;

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

    httpServer = app.listen(6000, () => console.log('Server running on http://localhost:6000/graphql'));
});

afterEach(async () => {
    httpServer.close();
});

describe('updatePostRoom mutation', () => {
    test('should update a room and return correct room data', async () => {
        const updateRoomTestMutation = `
            mutation {
                updatePostRoom(id: 123, length: 2, width: 12, height: 75) {
                    id
                    length
                    width
                    height
                }
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: updateRoomTestMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            console.log("responseeeeeee: ", response.body);
            // check if mutation returns correct room data 
            assert.strictEqual(response.body.data.updatePostRoom.id, '123');
            assert.strictEqual(response.body.data.updatePostRoom.length, 2);
            assert.strictEqual(response.body.data.updatePostRoom.width, 12);
            assert.strictEqual(response.body.data.updatePostRoom.height, 75);

            // check if service was called
            assert.strictEqual(postRoomService.updatePostRoom.calledOnce, true);
    });

    test('should throw error if dimensions are invalid', async () => {
        const updateRoomInvalidMutation = `
            mutation {
                updatePostRoom(id: 123, length: -5, width: 12, height: 16) {
                    id
                    length
                    width
                    height
                }
            }
        `;
        
    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: updateRoomInvalidMutation })
        .expect('Content-Type', /json/)
        .expect(200); // graphQL always returns 200 OK even on errors, check error message
        
    assert.strictEqual(response.body.errors[0].message, 'Dimensions used in the updated have to be greater than 0');
    
    })
});