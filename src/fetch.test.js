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
import Fetch from "./Fetch";

// declare which API requests to mock
const server = setupServer(
  // capture "GET /greeting" requests
  rest.get("/greeting", (req, res, ctx) => {
    // respond using a mocked JSON body
    return res(ctx.json({ greeting: "hello" }));
  })
);

// establish API mocking before all tests
beforeAll(() => server.listen());
// reset any request handlers that are declared as a part of our tests
// (i.e. for testing one-time error scenarios)
afterEach(() => server.resetHandlers());
// clean up once the tests are done
afterAll(() => server.close());

describe("fetch", () => {
  describe("on success", () => {
    test("loads and displays greeting", async () => {

      const { getByText, getByRole, debug } = render(<Fetch url="/greeting" />);

      fireEvent.click(getByText("Load Greeting"));

      await waitFor(() => getByRole("heading"));
      await waitForElementToBeRemoved(() => getByText("Load Greeting"));

      expect(getByRole("heading")).toHaveTextContent("hello");

      expect(getByRole("button")).toHaveAttribute("disabled");
    });

    test("loads and displays greeting to user 2", async () => {
      const greeting = "hello user 2";
      server.use(
        rest.get("/greeting", (req, res, ctx) => {
          return res(ctx.json({ greeting }));
        })
      );
      const { getByText, getByRole, debug } = render(<Fetch url="/greeting" />);

      userEvent.click(getByText("Load Greeting"));

      await waitFor(() => getByRole("heading"));
      await waitForElementToBeRemoved(() => getByText("Load Greeting"));

      expect(getByRole("heading")).toHaveTextContent(greeting);

      expect(getByRole("button")).toHaveAttribute("disabled");
    });
  });

  describe("on error", () => {
    test("handlers server error", async () => {
      server.use(
        rest.get("/greeting", (req, res, ctx) => {
          return res(ctx.status(500));
        })
      );

      const { getByText, getByRole, debug } = render(<Fetch url="/greeting" />);

      fireEvent.click(getByText("Load Greeting"));

      await waitFor(() => getByRole("alert"));

      expect(getByRole("alert")).toHaveTextContent(
        "Oops, failed to fetch!"
      );
      expect(getByRole("button")).not.toHaveAttribute("disabled");
    });
  });
});
