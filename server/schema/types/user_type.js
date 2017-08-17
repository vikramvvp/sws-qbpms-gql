const gqlisodate = require('graphql-iso-date');
const {GraphQLDateTime} = gqlisodate;
const graphql = require('graphql');
const {
  GraphQLObjectType,
  GraphQLString,
  GraphQLID,
  GraphQLBoolean
} = graphql;

const UserType = new GraphQLObjectType({
  name: 'UserType',
  fields: {
    id: { type: GraphQLID },
    username: { type: GraphQLString },
    password: {type: GraphQLString},
    admin: {type: GraphQLBoolean},
    created_at: {type:GraphQLDateTime}
  }
});

module.exports = UserType;
