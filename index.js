const {gql,ApolloServer} = require("apollo-server");
const {PubSub} = require("apollo-server");


const pubsub = new PubSub();
const typeDefs = gql`
    type Query {
        message:Message!
        user:User!
    }

    type Message {
        text:String!
        id:String!
    }

    type User {
        firstname:String!
        lastname:String!
        address:String!
        dept:String!
    } 

    input UserInput {
        firstname:String!
        lastname:String!
        address:String!
        dept:String!
    }

    type Mutation {
        createMessage(text:String!):Message!
        createUser(userInput:UserInput!):User!
    }

    type Subscription {
        messageCreated:Message!
        userCreated:User!
    }
`;

const NEW_MSG = "NEW_MSG";
const NEW_USER = "NEW_USER";

 const resolvers = {
     Query :{
         message:()=>{
             const message = {
                 text:"This is the text ",
                 id:"This is the id"
             }

             return message;
         },

         user:args=>{
             console.log(args);
             const user = {
                 firstname:"Firstname",
                 lastname:"Lastname",
                 address:"Pune",
                 dept:"IT"
             }
             return user;
         }
     },

     Mutation :{
        createMessage:(parent, {text})=>{
            const message = {
                text:text,
                id:"This is the id"
            }
            pubsub.publish(NEW_MSG,{
                messageCreated:message
            });

            return message;
        },
        createUser:(parent,{userInput})=>{
            const user = {
               firstname:userInput.firstname,
               lastname:userInput.lastname,
               address:userInput.address,
               dept:userInput.dept
            }

            pubsub.publish(NEW_USER,{
                userCreated:user
            });
            return user;
        }

     },

     Subscription:{
         messageCreated:{
             subscribe:()=>pubsub.asyncIterator(NEW_MSG)
         },
         userCreated:{
             subscribe:()=>pubsub.asyncIterator(NEW_USER)
         }

     }
 }

 const server = new ApolloServer({
     typeDefs,
     resolvers,
     context:({req,res})=>({req,res,pubsub})
 });

server.listen().then(({url})=>console.log(`server started at ${url}`));
 
 

