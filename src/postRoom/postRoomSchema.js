const { gql } = require('apollo-server-express');

// defining post schema

const roomTypeDefs = gql`

    type Room {
        id: ID! 
        length: Float!
        width: Float!
        height: Float!
    }

    type Query {
        getPostRoom(id: ID!): Room 
        getPostAllRooms: [Room]
    }

    type Mutation {
        createPostRoom(id: Int!, length: Float!, width: Float!, height: Float!): Room 
        updatePostRoom(id: Int!, length: Float!, width: Float!, height: Float!): Room 
        deletePostRoom(id: Int!): Boolean
    }
`;

module.exports = roomTypeDefs;