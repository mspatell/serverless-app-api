const { getNote } = require("./api.js");

const db = require("./db");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { GetItemCommand } = require("@aws-sdk/client-dynamodb");
jest.mock("@aws-sdk/util-dynamodb");
jest.mock("./db"); // Mock the database module

describe("Notes CRUD", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  describe("getNote", () => {
    test("should retrieve note successfully", async () => {
      const event = {
        pathParameters: {
          noteId: "50",
        },
      };
      const mockItem = {
        noteId: "100",
        title: "Test Note",
        content: "This is a test note.",
      };
      const mockResponse = {
        Item: marshall(mockItem),
      };
      db.send.mockResolvedValueOnce({ Item: marshall(mockResponse.Item) });

      const response = await getNote(event); // Call the getNote function with the event object
      console.log("string", response);
      expect(response.statusCode).toBe(200); // Verify that the response has a status code of 200

      // Verify that the response body matches the expected JSON string
      expect(response.body).toEqual(
        JSON.stringify({
          message: "No note available in the database with id.",
        })
      );
    });

    test("should handle failure to retrieve note", async () => {
      const event = {
        pathParameters: {
          noteId: "100",
        },
      };
      const expectedParams = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ noteId: "100" }),
      };
      const errorMessage = "Failed to get note.";
      const errorStack = "Error stack trace";
      db.send.mockRejectedValueOnce(new Error(errorMessage));
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementationOnce(() => {});

      const response = await getNote(event);
      response.body = JSON.parse(response.body);
      console.log("another string", response.body.message);

      expect(response.statusCode).toBe(500);
      expect(response.body.message).toEqual(errorMessage);
    });
  });
});