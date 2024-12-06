const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const updateFurnitureResolver = require('../src/postFurniture/postMutations/updatePostFurniture');
const postFurnitureServices = require('../src/postFurniture/postFurnitureServices');

sinon.stub(postFurnitureServices, 'updatePostFurniture').callsFake(async (args) => {
    return {
        id: args.id, 
        position_x: args.position_x,
        position_y: args.position_y,
        position_z: args.position_z, 
        length: args.length,
        width: args.width,
        height: args.height,
        roomId: args.roomId,
    }
});

const typeDefs = gql`
    type Furniture {
        id: ID!
        position_x: Float!
        position_y: Float!
        position_z: Float!
        length: Float!
        width: Float!
        height: Float!
        roomId: ID!
    }
    type Query {
        _empty: String 
    }
    type Mutation {
        updatePostFurniture(id: ID!, position_x: Float!, position_y: Float!, position_z: Float!, 
        length: Float!, width: Float!, height: Float!, roomId: ID!
        ): Furniture!
    }
    `;

    const resolvers = updateFurnitureResolver;

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

        httpServer = app.listen(4020, () => console.log('Server running on http://localhost:4020/graphql'));
    });

    afterEach(async () => {
        sinon.restore();

        if (httpServer) {
            await new Promise(resolve => httpServer.close(resolve));
        }
    });

    describe('updatePostFurniture mutation', () => {
        test('should update a furniture and return correct furniture data', async () => {
            const updateFurnitureValidMutation = `
                mutation {
                    updatePostFurniture(id: 123, position_x: 1, position_y: 2, position_z: 3, length: 2, width: 12, height: 75, roomId: 1) {
                        id
                        position_x
                        position_y
                        position_z
                        length
                        width
                        height
                        roomId
                    }
                }
            `;
    
        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: updateFurnitureValidMutation })
            .expect('Content-Type', /json/)
            .expect(200)
    
                console.log("responseeeeeee: ", response.body);
                // check if mutation returns correct room data 
                assert.strictEqual(response.body.data.updatePostFurniture.id, '123');
                assert.strictEqual(response.body.data.updatePostFurniture.length, 2);
                assert.strictEqual(response.body.data.updatePostFurniture.width, 12);
                assert.strictEqual(response.body.data.updatePostFurniture.height, 75);
    
                // check if service was called
                assert.strictEqual(postFurnitureServices.updatePostFurniture.calledOnce, true);
        });

        test('should throw error if update dimensions are negative', async () => {
            const updateFurnitureInvalidMutation = `
                mutation {
                    updatePostFurniture(id: 123, position_x: 1, position_y: 2, position_z: 3, length: 2, width: 12, height: -75, roomId: 1) {
                        id
                        position_x
                        position_y
                        position_z
                        length
                        width
                        height
                        roomId
                    }
                }
            `;
    
        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: updateFurnitureInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(200)
    
            assert.strictEqual(response.body.errors[0].message, 'Dimensions used in the updated have to be greater than 0');
        });

        test('should throw error if update dimensions are higher than maximum', async () => {
            const updateFurnitureInvalidMutation = `
                mutation {
                    updatePostFurniture(id: 123, position_x: 1, position_y: 2, position_z: 3, length: 2, width: 120, height: 75, roomId: 1) {
                        id
                        position_x
                        position_y
                        position_z
                        length
                        width
                        height
                        roomId
                    }
                }
            `;
    
        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: updateFurnitureInvalidMutation })
            .expect('Content-Type', /json/)
            .expect(200)
    
            assert.strictEqual(response.body.errors[0].message, 'Update dimensions for furniture have to be less than 100');
        });

        
    });