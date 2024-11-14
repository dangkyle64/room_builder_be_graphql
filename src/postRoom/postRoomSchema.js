const { gql } = require('apollo-server-express');

// defining post schema

const roomTypeDefs = gql`

    type Room {
        id: ID! 
        length: Int!
        width: Int!
        height: Int!
    }

    type Query {
        getPostRoom(id: ID!): Room 
        getPostRooms: [Room]
    }

    type Mutation {
        createPostRoom(id: Int!, length: Int!, width: Int!, height: Int!): Room 
        updatePostRoom(id: Int!, length: Int!, width: Int!, height: Int!): Room 
        deletePostRoom(id: Int!): Boolean
    }
`;

module.exports = roomTypeDefs;