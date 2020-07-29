// import dependencies
import React from "react";

// import API mocking utilities from Mock Service Worker
import { rest } from "msw";
import { setupServer } from "msw/node";

// import react-testing methods
import {
  render,
  fireEvent,
  waitFor,
  screen,
  act,
  waitForElementToBeRemoved,
} from "@testing-library/react";

// import { renderHook } from '@testing-library/react-hooks';
import userEvent from "@testing-library/user-event";

// add custom jest matchers from jest-dom
import "@testing-library/jest-dom/extend-expect";
// the component to test
import Logs from "./Logs";

const response = {
  results: [{ id: "test-uiwt-3909", type: "validated", status: "Sucess" }],
  totalResults: 1,
};
const url = "/user/12345/logs?when=today";
const loadData = "Load logs";

// declare which API requests to mock
const server = setupServer(
  // capture "GET /user/12345/logs?when=today" requests
  rest.get(url, (req, res, ctx) => {
    // respond using a mocked JSON body
    return res(ctx.json(response));
  })
);

// establish API mocking before all tests
beforeAll(() => server.listen());
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());
// clean up once the tests are done
afterAll(() => server.close());

describe("Logs", () => {
  describe("on success", () => {
    test("loads and displays greeting", async () => {
      const { getByText, getByRole, getByTestId, debug } = render(<Logs url={url} />);

      fireEvent.click(getByText(loadData));

      await waitFor(() => getByRole("heading"));
      // await waitForElementToBeRemoved(() => getByText(loadData));
      debug();
      expect(getByTestId("log-id")).toHaveTextContent(response.results[0].id);

      expect(getByRole("button")).toHaveAttribute("disabled");
    });
  });

  describe("on error", () => {
    test("handlers server error", async () => {
      server.use(
        rest.get("/user/12345/logs?when=today", (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      const { getByText, getByRole, debug } = render(<Logs url={url} />);

      fireEvent.click(getByText(loadData));

      await waitFor(() => getByRole("alert"));

      expect(getByRole("alert")).toHaveTextContent("Oops, failed to fetch!");
      expect(getByRole("button")).not.toHaveAttribute("disabled");
    });
  });
});
