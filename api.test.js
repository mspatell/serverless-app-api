const { getNote } = require("./api.js");

const db = require("./db");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");
const { GetItemCommand } = require("@aws-sdk/client-dynamodb");

jest.mock("./db"); // Mock the database module

describe("Notes CRUD", () => {
  afterEach(() => {
    jest.clearAllMocks(); // Clear all mocks after each test
  });

  describe("getNote", () => {
    test("should retrieve note successfully", async () => {
      const event = {
        pathParameters: {
          noteId: "100",
        },
      };
      const expectedParams = {
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ noteId: "100" }),
      };
      const mockResponse = {
        Item: {
          noteId: "100",
          title: "Test Note",
          content: "This is a test note.",
        },
      };
      db.send.mockResolvedValueOnce({ Item: marshall(mockResponse.Item) });

      const response = await getNote(event);
      console.log("string", response);

      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(
        JSON.stringify({
          message: "Successfully retrieved note.",
          data: mockResponse.Item,
          rawData: marshall(mockResponse.Item),
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
