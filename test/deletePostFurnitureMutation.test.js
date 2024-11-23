const assert = require('assert');
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon');

const deletePostFurnitureResolver = require('../src/postFurniture/postMutations/deletePostFurniture');
const postFurnitureServices = require('../src/postFurniture/postFurnitureServices');

const typeDefs = gql`
    type Furniture {
        id: ID!
        length: Float!
        width: Float!
        height: Float!
        roomId: ID!
    }
    type Query {
        _empty: String
    }

    type Mutation {
        deletePostFurniture(id: ID!): Boolean
    }
`;

const resolvers = deletePostFurnitureResolver;

let app;
let testServer;
let httpServer;
let createdFurniture;

beforeEach(async () => {
    app = express();
    testServer = new ApolloServer({ 
        typeDefs, 
        resolvers,
    });

    await testServer.start()
    testServer.applyMiddleware({ app });

    httpServer = app.listen(4010, () => console.log('Server running on http://localhost:4010/graphql'));

    // Create a furniture before each test
    createdFurniture = await postFurnitureServices.createPostFurniture({
        id: '123',
        length: 10,
        width: 15,
        height: 5,
        roomId: 1,
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
describe('deletePostFurniture mutation', () => {
    test('should delete a furniture and return success message', async () => {
        const deletePostFurnitureValidMutation = `
            mutation {
                deletePostFurniture(id: 123)
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: deletePostFurnitureValidMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if deleted properly
            //console.log("Response Body for delete", response.body);
            assert.strictEqual(response.body.data.deletePostFurniture, true);
    });

    test('should return an error because furniture does not exist', async () => {

        // mock missing furniture
        const getFurnitureByIdStub = sinon.stub(postFurnitureServices, 'getFurnitureById').resolves(null);

        const deletePostFurnitureInvalidMutation = `
            mutation {
                deletePostFurniture(id: 321)
            }
        `;

    const response = await supertest(httpServer)
        .post('/graphql')
        .send({ query: deletePostFurnitureInvalidMutation })
        .expect('Content-Type', /json/)
        .expect(200)

            // check if deleted properly
            //console.log("Response Body for delete", response.body);
            assert.strictEqual(response.body.data.deletePostFurniture, null);

            assert.strictEqual(getFurnitureByIdStub.calledOnce, true);

    });
});