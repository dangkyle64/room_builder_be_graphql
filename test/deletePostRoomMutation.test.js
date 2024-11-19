const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const deletePostRoomResolver = require('../src/postRoom/postMutations/deletePostRoom');
const postRoomServices = require('../src/postRoom/postRoomServices');

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

const resolvers = deletePostRoomResolver;

let app;
let testServer;
let httpServer;
let createdRoom;

beforeEach(async () => {
    app = express();
    testServer = new ApolloServer({ 
        typeDefs, 
        resolvers,
    });

    await testServer.start()
    testServer.applyMiddleware({ app });

    httpServer = app.listen(4005, () => console.log('Server running on http://localhost:4005/graphql'));

    // Create a room before each test
    createdRoom = await postRoomServices.createPostRoom({
        id: '123',
        length: 10,
        width: 15,
        height: 5,
    });

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
describe('deletePostRoom mutation', () => {
    test('should delete a room and return success message', async () => {
        const deletePostRoomValidMutation = `
            mutation {
                deletePostRoom(id: 123)
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: deletePostRoomValidMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if deleted properly
            //console.log("Response Body for delete", response.body);
            assert.strictEqual(response.body.data.deletePostRoom, true);
    });

    test('should return an error because room does not exist', async () => {

        // mock missing room
        const getRoomByIdStub = sinon.stub(postRoomServices, 'getRoomById').resolves(null);

        const deletePostRoomInvalidMutation = `
            mutation {
                deletePostRoom(id: 321)
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: deletePostRoomInvalidMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if deleted properly
            //console.log("Response Body for delete", response.body);
            assert.strictEqual(response.body.data.deletePostRoom, null);

            assert.strictEqual(getRoomByIdStub.calledOnce, true);

    });
});