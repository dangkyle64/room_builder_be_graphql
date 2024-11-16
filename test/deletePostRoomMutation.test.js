const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const deletePostRoomMutation = require('../src/postRoom/postMutations/deletePostRoom');
const postRoomService = require('../src/postRoom/postRoomServices');

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
        deletePostRoom(id: ID!): Boolean
    }
`;

const resolvers = deletePostRoomMutation;

let app;
let testServer;
let httpServer;
let createdRoom;

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

    httpServer = app.listen(7000, () => console.log('Server running on http://localhost:7000/graphql'));

    // Create a room before each test
    createdRoom = await postRoomService.createPostRoom({
        id: '123',
        length: 10,
        width: 15,
        height: 5,
    });

});

afterEach(async () => {
    sinon.restore();
    httpServer.close();
});

describe('deletePostRoom mutation', () => {
    test('should delete a room and return success message', async () => {
        const deletePostRoomTestMutation = `
            mutation {
                deletePostRoom(id: 123)
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: deletePostRoomTestMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if deleted properly
            //console.log("Response Body for delete", response.body);
            assert.strictEqual(response.body.data.deletePostRoom, true);
    });

    test('should return an error because room does not exist', async () => {

        // mock missing room
        const getRoomByIdStub = sinon.stub(postRoomService, 'getRoomById').resolves(null);

        const deletePostRoomTestMutation = `
            mutation {
                deletePostRoom(id: 321)
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: deletePostRoomTestMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if deleted properly
            //console.log("Response Body for delete", response.body);
            assert.strictEqual(response.body.data.deletePostRoom, null);

            // restore stub 
            getRoomByIdStub.restore();
    });
});