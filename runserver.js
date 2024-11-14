const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const typeDefs = require('./schema');
const { resolvers } = require('./resolvers');

const app = express();

// initialize Apollo server
const server = new ApolloServer({
    typeDefs,
    resolvers,
    formatError: (error) => {
        console.error(error);
    },
    
    introspection: true, // off in production
    playground: true, // off in production
});

async function startServer() {
    await server.start();

    // apply Apollo GraphQL middleware at /graphql endpoint
    server.applyMiddleware({ app, path: '/graphql'});

    app.listen(4000, () => {
        console.log('Server running on http://localhost:4000/graphql');
    });
}

startServer();


