const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const roomTypeDefs = require('./src/postRoom/postRoomSchema');
const postRoomResolvers = require('./src/postRoom/postRoomResolvers');
const app = express();

// initialize Apollo server
const server = new ApolloServer({
    typeDefs: roomTypeDefs,
    resolvers: postRoomResolvers,

    // check for errors
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


