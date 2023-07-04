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
          noteId: "100",
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
      db.send.mockResolvedValueOnce({ Item: mockResponse.Item });

      const response = await getNote(event); // Call the getNote function with the event object
      console.log("string", response);
      expect(response.statusCode).toBe(200); // Verify that the response has a status code of 200

      // Verify that the response body matches the expected JSON string
      expect(response.body).toEqual(
        JSON.stringify({
          message: "Successfully retrieved note.",
          data: unmarshall(mockResponse.Item),
          rawData: mockResponse.Item,
        })
      );
    });

    test("should return error message if note does not exist", async () => {
      const event = {
        pathParameters: {
          noteId: "100",
        },
      };
      const mockResponse = {
        Item: null,
      };
      db.send.mockResolvedValueOnce({ Item: mockResponse.Item });

      const response = await getNote(event);
      expect(response.statusCode).toBe(200);
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
      const errorMessage = "Failed to get note.";
      db.send.mockRejectedValueOnce(new Error(errorMessage));

      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementationOnce(() => {});

      const response = await getNote(event);
      expect(response.statusCode).toBe(500);
      expect(response.body).toEqual(
        JSON.stringify({
          message: "Failed to get note.",
          errorMsg: errorMessage,
          errorStack: expect.any(String),
        })
      );
    });
  });
});