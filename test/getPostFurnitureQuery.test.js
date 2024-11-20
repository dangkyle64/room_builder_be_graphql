const assert = require('assert')
const express = require('express');
const { describe, test, beforeEach, afterEach } = require('node:test');
const supertest = require('supertest');
const { ApolloServer, gql } = require('apollo-server-express');
const sinon = require('sinon')

const getPostFurnitureResolver = require('../src/postFurniture/postQueries/getPostFurniture');
const postFurnitureServices = require('../src/postFurniture/postFurnitureServices');

const typeDefs = gql`
    type Furniture {
        id: ID!
        length: Float!
        height: Float!
        width: Float!
        roomId: ID!
    }

    type Query {
        getPostFurniture(id: ID!) : Furniture!
    }

    type Mutation {
        _empty: String
    }
`;

const resolvers = getPostFurnitureResolver;

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

    httpServer  = app.listen(4008, () => console.log('Server running on http://localhost:4008/graphql'));

    createdFurniture = await postFurnitureServices.createPostFurniture({
        id: 123,
        length: 5.23,
        width: 0.23,
        height: 4.2,
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

describe('Query Furniture by ID',  () => {
    test('should send back correct furniture data when given ID input', async () => {

        sinon.stub(postFurnitureServices, 'getFurnitureById').callsFake(async () => {
            return {
                id: 123,
                length: 5.23,
                width: 0.23,
                height: 4.2,
                roomId: 1,
            };
        });

        const getFurnitureByIdValidQuery = `
            query {
                getPostFurniture(id: 123) {
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
        .send({ query: getFurnitureByIdValidQuery })
        .expect('Content-Type', /json/)
        .expect(200)

        assert.strictEqual(response.body.data.getPostFurniture.id, '123');
        assert.strictEqual(response.body.data.getPostFurniture.length, 5.23);
        assert.strictEqual(response.body.data.getPostFurniture.width, 0.23);
        assert.strictEqual(response.body.data.getPostFurniture.height, 4.2);
        assert.strictEqual(response.body.data.getPostFurniture.roomId, '1');
    });

    test('should return an error because furniture does not exist', async () => {

        sinon.stub(postFurnitureServices, 'getFurnitureById').resolves(null);

        const getFurnitureByIdInvalidQuery =`
            query {
                getPostFurniture(id: 321) {
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
        .send({ query: getFurnitureByIdInvalidQuery})
        .expect('Content-Type', /json/)
        .expect(200)

        assert.strictEqual(response.body.errors[0].message, 'Furniture with id: 321 does not exist.')
    });
})