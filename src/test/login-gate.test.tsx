import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LoginGate, isValidLogin } from "@/components/login-gate";

afterEach(cleanup);

describe("Temporary mockup login", () => {
  it("accepts the requested admin/admin demo login", () => {
    expect(isValidLogin("admin", "admin")).toBe(true);
    expect(isValidLogin("admin", "wrong")).toBe(false);
  });

  it("opens all mockup content on successful login without a role restriction", () => {
    render(<LoginGate><div>All mockup content</div></LoginGate>);
    expect(screen.queryByText("All mockup content")).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Username"), { target: { value: "admin" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong" } });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: "Masuk" }));
    expect(screen.getByText("All mockup content")).toBeInTheDocument();
  });
});