const assert = require('assert');
const express = require('express')
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const getPostAllRoomsResolver = require('../src/postRoom/postQueries/getPostAllRooms');
const postRoomServices = require('../src/postRoom/postRoomServices')

const typeDefs = gql`
    type Room {
        id: ID!
        length: Float!
        width: Float!
        height: Float!
    }

    type Query {
        getPostAllRooms: [Room]
    }

    type Mutation {
        _empty: String
    }
`;

let app;
let testServer;
let httpServer;

const resolvers = getPostAllRoomsResolver;

beforeEach(async () => {
    app = express()
    testServer = new ApolloServer({
        typeDefs, 
        resolvers,
    });

    await testServer.start();
    testServer.applyMiddleware({ app });

    httpServer = app.listen(4001, () => console.log('Server running on http://localhost:4001/graphql'));
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

describe('Get all rooms query', () => {
    test('should return an array of all the rooms with correct data', async () => {
        
        const stub = sinon.stub(postRoomServices, 'getAllRooms').callsFake(async () => {
            return [
                {
                    id: 123,
                    length: 12.232,
                    width: 1.232,
                    height: 12.2
                },
                {
                    id: 234,
                    length: 14.32,
                    width: 15.232,
                    height: 1.2
                }
            ];
        });
        const getAllRoomsValidQuery = `
            query {
                getPostAllRooms {
                    id 
                    length 
                    width 
                    height
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: getAllRoomsValidQuery })
            .expect('Content-Type', /json/)
            .expect(200)

            //console.log("The response body of getPostAllRooms: ", JSON.stringify(response.body))
            assert.strictEqual(response.body.data.getPostAllRooms.length, 2);

            const room1 = response.body.data.getPostAllRooms[0];
            const room2 = response.body.data.getPostAllRooms[1];

            assert.strictEqual(room1.id, '123');
            assert.strictEqual(room1.length, 12.232);
            assert.strictEqual(room1.width, 1.232);
            assert.strictEqual(room1.height, 12.2);

            assert.strictEqual(room2.id, '234');
            assert.strictEqual(room2.length, 14.32);
            assert.strictEqual(room2.width, 15.232);
            assert.strictEqual(room2.height, 1.2);

            assert.strictEqual(stub.calledOnce, true)
    });

    test('should return an error because room does not exist', async () => {

        // mock missing room
        sinon.stub(postRoomServices, 'getAllRooms').resolves(null);

        const getPostAllRoomInvalidQuery = `
            query {
                getPostAllRooms {
                    id 
                    length 
                    width 
                    height
                }
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: getPostAllRoomInvalidQuery })
        .expect('Content-Type', /json/)
        .expect(200)

            assert.strictEqual(response.body.data.getPostAllRooms, null);

    });
});