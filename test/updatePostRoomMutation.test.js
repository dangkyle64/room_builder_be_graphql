const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const updateRoomResolver = require('../src/postRoom/postMutations/updatePostRoom');
const postRoomServices = require('../src/postRoom/postRoomServices');

// mock room injection
sinon.stub(postRoomServices, 'updatePostRoom').callsFake(async (args) => {
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

const resolvers = updateRoomResolver;

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

    httpServer = app.listen(4004, () => console.log('Server running on http://localhost:4004/graphql'));
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

describe('updatePostRoom mutation', () => {
    test('should update a room and return correct room data', async () => {
        const updateRoomValidMutation = `
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
        .send({ query: updateRoomValidMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            //console.log("responseeeeeee: ", response.body);
            // check if mutation returns correct room data 
            assert.strictEqual(response.body.data.updatePostRoom.id, '123');
            assert.strictEqual(response.body.data.updatePostRoom.length, 2);
            assert.strictEqual(response.body.data.updatePostRoom.width, 12);
            assert.strictEqual(response.body.data.updatePostRoom.height, 75);

            // check if service was called
            assert.strictEqual(postRoomServices.updatePostRoom.calledOnce, true);
    });

    test('should throw error if update dimensions are negative', async () => {
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

    test('should throw error if update dimensions are higher than maximum', async () => {
        const updateRoomInvalidMutation = `
            mutation {
                updatePostRoom(id: 123, length: 105, width: 15.21, height: 25) {
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

        assert.strictEqual(response.body.errors[0].message, 'Update dimensions for room have to be less than 100');
    });

    test('should throw error if update measurements are not integer or float', async () => {
        const updateRoomInvalidMutation = `
            mutation {
                updatePostRoom(id: 123, length: banana, width: 15.21, height: 25) {
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
            .expect(400); // graphQL will return 400 if query is invalid

        assert.strictEqual(response.body.errors[0].message, 'Float cannot represent non numeric value: banana');
    });

    test('should throw error if update measurements are null', async () => {
        const updateRoomInvalidMutation = `
            mutation {
                updatePostRoom(id: 123, length: 12.23, height: 25) {
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
            .expect(400); // graphQL will return 400 if query is invalid

        assert.strictEqual(response.body.errors[0].message, 'Field "updatePostRoom" argument "width" of type "Float!" is required, but it was not provided.');
    });
});