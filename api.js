const db = require("./db");
const {
  GetItemCommand,
  PutItemCommand,
  DeleteItemCommand,
  ScanCommand,
  UpdateItemCommand,
} = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

// Function to create a new note
// const createNote = async (event) => {
// const response = { statusCode: 200 };

//     try {
//         const body = JSON.parse(event.body);
//         const params = {
//             TableName: process.env.DYNAMODB_TABLE_NAME,
//             Item: marshall(body || {}),
//         };
//         const createResult = await db.send(new PutItemCommand(params));

//         response.body = JSON.stringify({
//             message: "Successfully created note.",
//             createResult,
//         });
//     } catch (e) {
//         console.error(e);
//         response.statusCode = 500;
//         response.body = JSON.stringify({
//             message: "Failed to create note.",
//             errorMsg: e.message,
//             errorStack: e.stack,
//         });
//     }

//     return response;
// };

const createNote = async (event) => {
  const response = { statusCode: 200 };
  console.log("test log for ci/cd pipeline");
  try {
    const body = JSON.parse(event.body);
    const noteId = body.noteId;

    if (!noteId) {
      response.statusCode = 400;
      response.body = JSON.stringify({
        message: "Missing noteId in the request body.",
      });
      return response;
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ noteId }),
    };

    const getResult = await db.send(new GetItemCommand(params));

    if (getResult.Item) {
      response.body = JSON.stringify({
        message:
          "A note with the same noteId already exists. Please create new note with UNIQUE 'noteId'",
      });
    } else {
      const createResult = await db.send(
        new PutItemCommand({
          TableName: process.env.DYNAMODB_TABLE_NAME,
          Item: marshall(body),
        })
      );

      response.body = JSON.stringify({
        message: "Successfully created note.",
        createResult,
      });
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to create note.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

// Function to retrieve a note by noteId
const getNote = async (event) => {
  const response = { statusCode: 200 };

  try {
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ noteId: event.pathParameters.noteId }),
    };
    // Check if the note exists in the database
    const getResult = await db.send(new GetItemCommand(params));

    if (!getResult.Item) {
      // Note does not exist
      response.body = JSON.stringify({
        message: "No note available in the database with id.",
      });
    } else {
      const { Item } = await db.send(new GetItemCommand(params));

      console.log({ Item });
      console.log("ci/cd check 2");
      response.body = JSON.stringify({
        message: "Successfully retrieved note.",
        data: Item ? unmarshall(Item) : {},
        rawData: Item,
      });
    }
  } catch (e) {
    console.error(e); // Prepare the error response in case of failure
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to get note.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

// Function to update a note by noteId
// const updateNote = async (event) => {
//   const response = { statusCode: 200 };

//   try {
//       const body = JSON.parse(event.body);
//       const objKeys = Object.keys(body);
//       const params = {
//           TableName: process.env.DYNAMODB_TABLE_NAME,
//           Key: marshall({ noteId: event.pathParameters.noteId }),
//           UpdateExpression: `SET ${objKeys.map((_, index) => `#key${index} = :value${index}`).join(", ")}`,
//           ExpressionAttributeNames: objKeys.reduce((acc, key, index) => ({
//               ...acc,
//               [`#key${index}`]: key,
//           }), {}),
//           ExpressionAttributeValues: marshall(objKeys.reduce((acc, key, index) => ({
//               ...acc,
//               [`:value${index}`]: body[key],
//           }), {})),
//       };
//       const updateResult = await db.send(new UpdateItemCommand(params));

//       response.body = JSON.stringify({
//           message: "Successfully updated note.",
//           updateResult,
//       });
//   } catch (e) {
//       console.error(e);
//       response.statusCode = 500;
//       response.body = JSON.stringify({
//           message: "Failed to update note.",
//           errorMsg: e.message,
//           errorStack: e.stack,
//       });
//   }

//   return response;
// };

const updateNote = async (event) => {
  const response = { statusCode: 200 };

  try {
    const body = JSON.parse(event.body);
    const noteId = event.pathParameters.noteId;

    const getParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ noteId }),
    };

    const getResult = await db.send(new GetItemCommand(getParams));

    if (!getResult.Item) {
      response.body = JSON.stringify({
        message: "Create a new note first before updating.",
      });
      return response;
    }

    const objKeys = Object.keys(body);
    const updateParams = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ noteId }),
      UpdateExpression: `SET ${objKeys
        .map((_, index) => `#key${index} = :value${index}`)
        .join(", ")}`,
      ExpressionAttributeNames: objKeys.reduce(
        (acc, key, index) => ({
          ...acc,
          [`#key${index}`]: key,
        }),
        {}
      ),
      ExpressionAttributeValues: marshall(
        objKeys.reduce(
          (acc, key, index) => ({
            ...acc,
            [`:value${index}`]: body[key],
          }),
          {}
        )
      ),
    };

    const updateResult = await db.send(new UpdateItemCommand(updateParams));

    response.body = JSON.stringify({
      message: "Successfully updated note.",
      updateResult,
    });
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to update note.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

const deleteNote = async (event) => {
  const response = { statusCode: 200 };

  try {
    const noteId = event.pathParameters.noteId;
    const params = {
      TableName: process.env.DYNAMODB_TABLE_NAME,
      Key: marshall({ noteId: event.pathParameters.noteId }), // The primary key value to identify the note to delete
    };

    // Check if the note exists in the database
    const getResult = await db.send(new GetItemCommand(params));

    if (!getResult.Item) {
      // Note does not exist
      response.statusCode = 404;
      response.body = JSON.stringify({
        message: "No note found with the provided noteId.",
      });
    } else {
      // Note exists, perform the delete operation
      const deleteResult = await db.send(new DeleteItemCommand(params));

      response.body = JSON.stringify({
        message: "Successfully deleted note.",
        deleteResult, // Result of the delete operation
      });
    }
  } catch (e) {
    console.error(e);
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to delete note.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

//Function to scan entire table and fetch all notes
const getAllNotes = async () => {
  const response = { statusCode: 200 };

  try {
    const { Items } = await db.send(
      new ScanCommand({ TableName: process.env.DYNAMODB_TABLE_NAME })
    );
    // Perform a scan operation in DynamoDB to retrieve all notes in the table
    response.body = JSON.stringify({
      message: "Successfully retrieved all notes.",
      data: Items.map((item) => unmarshall(item)), // Unmarshall each item to convert DynamoDB format to JSON
      Items, // Raw items retrieved from DynamoDB
    });
  } catch (e) {
    console.error(e); // Prepare the error response in case of failure
    response.statusCode = 500;
    response.body = JSON.stringify({
      message: "Failed to retrieve notes.",
      errorMsg: e.message,
      errorStack: e.stack,
    });
  }

  return response;
};

module.exports = {
  //exporting functions
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getAllNotes,
};
