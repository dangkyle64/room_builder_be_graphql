const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test')
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const getPostRoomQuery = require('../src/postRoom/postQueries/getPostRoom');
const postRoomService = require('../src/postRoom/postRoomServices');

const typeDefs = gql`
    type Room {
        id: ID!
        length: Float!
        width: Float!
        height: Float!
    }

    type Query {
        getPostRoom(id: ID!) : Room!
    }

    type Mutation {
        _empty: String
    }
`;

const resolvers = getPostRoomQuery;

let app;
let testServer;
let httpServer;

beforeEach(async () => {
    app = express();
    testServer = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await testServer.start();
    testServer.applyMiddleware({ app });

    httpServer = app.listen(9000, () => console.log('Server running on http://localhost:9000/graphql'));

    // Create a room before each test
    createdRoom = await postRoomService.createPostRoom({
        id: 123,
        length: 10.12,
        width: 15.65,
        height: 5.1243,
    });
});

afterEach(async () => {
    httpServer.close();
});

describe('Query Room by ID', () => {
    test('should send back correct room data when given ID input', async () => {
        const getRoomByIdTest =`
            query {
                getPostRoom(id: 123) {
                    id 
                    length 
                    width 
                    height
                }
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: getRoomByIdTest })
        .expect('Content-Type', /json/)
        .expect(200)

        assert.strictEqual(response.body.data.getPostRoom.id, '123');
    })

    test('should return an error because room does not exist', async () => {

        // mock missing room
        const getRoomByIdStub = sinon.stub(postRoomService, 'getRoomById').resolves(null);

        const getRoomByIdInvalidTest = `
            query {
                getPostRoom(id: 321) {
                    id
                    length
                    width
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: getRoomByIdInvalidTest })
            .expect('Content-Type', /json/)
            .expect(200)

            console.log("Errors:", response.body.errors);
            assert.strictEqual(response.body.errors[0].message, 'Room with id: 321 does not exist.');

            // restore stub 
            getRoomByIdStub.restore();
    });
});