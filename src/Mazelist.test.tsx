import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { describe, expect, test } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import Mazelist from "./components/Mazelist";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("Mazelist tests", () => {
  test("Mazelist renders without crashing", () => {
    render(<Mazelist />, {wrapper});
    expect(screen.getByText(/Loading/i)).toBeInTheDocument();
  });
  test("Mazes are fetched", async () => {
    render(<Mazelist />, {wrapper});
    await waitFor(() => screen.getByText(/New Maze/i));
    expect(screen.getByText(/binary_tree/i)).toBeInTheDocument();
  });
  test("Open new maze modal", async () => {
    render(<Mazelist />, {wrapper});
    await waitFor(() => screen.getByText(/New Maze/i));
    await userEvent.click(screen.getByText(/New Maze/i));
    expect(screen.getByText(/Save/i)).toBeInTheDocument();
  })
});
