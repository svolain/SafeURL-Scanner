const request = require('supertest');
const { app } = require('../app');  // Import your app using require
const axios = require('axios');

jest.mock('axios'); // Mock axios globally

describe("API and View Tests", () => {
  let server;

  beforeEach((done) => {
    jest.clearAllMocks();
    server = app.listen(3004, () => done());
  });

  afterEach((done) => {
    server.close(done);
  });

  it("should render the index page on GET /", async () => {
    const response = await request(server).get("/");
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Enter Url");
  });

  it("should handle API errors gracefully", async () => {
    axios.get = jest.fn().mockRejectedValueOnce(new Error("API request failed"));

    const response = await request(server).post("/").send({ url: "https://badurl1234rfr.com" });
    expect(response.statusCode).toBe(200);
    expect(response.text).toContain("Failed to scan URL");
  });
});
