const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const getPostAllFurnitureResolvers = require('../src/postFurniture/postQueries/getPostAllFurniture');
const postFurnitureServices = require('../src/postFurniture/postFurnitureServices');

const typeDefs = gql`
    type Furniture {
        id: ID!
        length: Float
        width: Float
        height: Float
        roomId: ID!
    }

    type Query {
        getPostAllFurniture: [Furniture]
    }

    type Mutation {
        _empty: String
    }
`;

let app;
let testServer;
let httpServer; 

const resolvers = getPostAllFurnitureResolvers;

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

    await testServer.start();
    testServer.applyMiddleware({ app });

    httpServer = app.listen(4007, () => console.log('Server running on http://localhost:4007/graphql'));
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

describe('get all furniture query', () => {
    test('should get all the furniture and return the correct data', async () => {

        const stub = sinon.stub(postFurnitureServices, 'getAllFurniture').callsFake(async () => {
            return [
                {
                    id: 123,
                    length: 12.4,
                    width: 53.2,
                    height: 12.3,
                    roomId: 1,
                },
                {
                    id: 234,
                    length: 15.4,
                    width: 13.2,
                    height: 19.3,
                    roomId: 2,
                }
            ];
        });

        const getAllFurnituresValidQuery = `
            query {
                getPostAllFurniture {
                    id 
                    length
                    width 
                    height 
                    roomId
                }
            }
        `;

        const response = await supertest(httpServer)
            .post('/graphql')
            .send({ query: getAllFurnituresValidQuery })
            .expect('Content-Type', /json/)
            .expect(200)

            console.log("The response body of getPostAllFurniture: ", JSON.stringify(response.body));
            assert.strictEqual(response.body.data.getPostAllFurniture.length, 2);

            const furniture1 = response.body.data.getPostAllFurniture[0];
            const furniture2 = response.body.data.getPostAllFurniture[1];

            assert.strictEqual(furniture1.id, '123');
            assert.strictEqual(furniture1.length, 12.4);
            assert.strictEqual(furniture1.width, 53.2);
            assert.strictEqual(furniture1.height, 12.3);
            assert.strictEqual(furniture1.roomId, '1');

            assert.strictEqual(furniture2.id, '234');
            assert.strictEqual(furniture2.length, 15.4);
            assert.strictEqual(furniture2.width, 13.2);
            assert.strictEqual(furniture2.height, 19.3);
            assert.strictEqual(furniture2.roomId, '2');

            assert.strictEqual(stub.calledOnce, true);
    });

    test('should return an error because furniture does not exist', async () => {

        // mock missing furniture
        sinon.stub(postFurnitureServices, 'getAllFurniture').resolves(null);

        const getPostAllFurnitureInvalidQuery = `
            query {
                getPostAllFurniture {
                    id 
                    length 
                    width 
                    height
                    roomId
                }
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: getPostAllFurnitureInvalidQuery })
        .expect('Content-Type', /json/)
        .expect(200)

            assert.strictEqual(response.body.data.getPostAllFurniture, null);

    });
});