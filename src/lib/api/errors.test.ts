import { ApiError, detailMessage, errorFromResponse, isApiError } from "./errors";

describe("detailMessage", () => {
  it("reads FastAPI's string detail", () => {
    expect(detailMessage({ detail: "Not signed in" }, "x")).toBe("Not signed in");
  });
  it("joins FastAPI validation errors with their field path", () => {
    const body = { detail: [{ loc: ["body", "email"], msg: "field required", type: "missing" }, { loc: ["query", "page"], msg: "not a number", type: "type_error" }] };
    expect(detailMessage(body, "x")).toBe("email: field required; query.page: not a number");
  });
  it("falls back for anything else", () => {
    expect(detailMessage(null, "fallback")).toBe("fallback");
    expect(detailMessage({ detail: 42 }, "fallback")).toBe("fallback");
    expect(detailMessage({ message: "nope" }, "fallback")).toBe("fallback");
  });
});

describe("errorFromResponse", () => {
  it("builds an ApiError from the status and detail", async () => {
    const error = await errorFromResponse(new Response(JSON.stringify({ detail: "Forbidden here" }), { status: 403 }));
    expect(isApiError(error)).toBe(true);
    expect(error).toMatchObject({ status: 403, detail: "Forbidden here" });
  });
  it("survives a non-JSON body", async () => {
    const error = await errorFromResponse(new Response("<html>bad gateway</html>", { status: 502, statusText: "Bad Gateway" }));
    expect(error).toBeInstanceOf(ApiError);
    expect(error.detail).toBe("Bad Gateway");
  });
});
