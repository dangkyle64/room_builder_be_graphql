const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test')
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const getPostRoomResolver = require('../src/postRoom/postQueries/getPostRoom');
const postRoomServices = require('../src/postRoom/postRoomServices');

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

const resolvers = getPostRoomResolver;

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

    httpServer = app.listen(4002, () => console.log('Server running on http://localhost:4002/graphql'));
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

describe('Query Room by ID', () => {
    test('should send back correct room data when given ID input', async () => {

        sinon.stub(postRoomServices, 'getRoomById').callsFake(async () => {
            return {
                id: 123,
                length: 52.23,
                width: 10.23,
                height: 43.2,
            };
        });

        const getRoomByIdalidQuery =`
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
        .send({ query: getRoomByIdalidQuery })
        .expect('Content-Type', /json/)
        .expect(200)

        assert.strictEqual(response.body.data.getPostRoom.id, '123');
        assert.strictEqual(response.body.data.getPostRoom.length, 52.23);
        assert.strictEqual(response.body.data.getPostRoom.width, 10.23);
        assert.strictEqual(response.body.data.getPostRoom.height, 43.2);
    })

    test('should return an error because room does not exist', async () => {

        // mock missing room
        sinon.stub(postRoomServices, 'getRoomById').resolves(null);

        const getRoomByIdInvalidQuery = `
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
            .send({ query: getRoomByIdInvalidQuery })
            .expect('Content-Type', /json/)
            .expect(200)

            //console.log("Errors:", response.body.errors);
            assert.strictEqual(response.body.errors[0].message, 'Room with id: 321 does not exist.');

    });
});