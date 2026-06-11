import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Pagination from "../components/Pagination";

const defaults = {
  currentPage: 1,
  totalPages: 5,
  totalItems: 50,
  onPageChange: vi.fn(),
  loading: false,
};

beforeEach(() => vi.clearAllMocks());

describe("Pagination", () => {
  it("renders info text", () => {
    render(<Pagination {...defaults} />);
    expect(
      screen.getByText(
        (c, e) => e?.tagName === "DIV" && c.includes("Showing page 1 of 5"),
      ),
    ).toBeInTheDocument();
  });

  it("renders nothing for single page", () => {
    const { container } = render(<Pagination {...defaults} totalPages={1} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders page numbers", () => {
    render(<Pagination {...defaults} />);
    ["1", "2", "3", "4", "5"].forEach((n) =>
      expect(screen.getByText(n)).toBeInTheDocument(),
    );
  });

  it("renders prev/next buttons", () => {
    render(<Pagination {...defaults} />);
    expect(screen.getByLabelText("Previous page")).toBeInTheDocument();
    expect(screen.getByLabelText("Next page")).toBeInTheDocument();
  });

  it("highlights current page", () => {
    render(<Pagination {...defaults} currentPage={3} />);
    expect(screen.getByLabelText("Page 3")).toHaveAttribute(
      "aria-current",
      "page",
    );
  });

  it("calls onPageChange on prev click", () => {
    render(<Pagination {...defaults} currentPage={3} />);
    fireEvent.click(screen.getByLabelText("Previous page"));
    expect(defaults.onPageChange).toHaveBeenCalledWith(2);
  });

  it("calls onPageChange on next click", () => {
    render(<Pagination {...defaults} currentPage={3} />);
    fireEvent.click(screen.getByLabelText("Next page"));
    expect(defaults.onPageChange).toHaveBeenCalledWith(4);
  });

  it("calls onPageChange on page click", () => {
    render(<Pagination {...defaults} currentPage={1} />);
    fireEvent.click(screen.getByLabelText("Page 3"));
    expect(defaults.onPageChange).toHaveBeenCalledWith(3);
  });

  it("disables prev on first page", () => {
    render(<Pagination {...defaults} currentPage={1} />);
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
  });

  it("disables next on last page", () => {
    render(<Pagination {...defaults} currentPage={5} />);
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("shows ellipsis for 10 pages at page 5", () => {
    render(<Pagination {...defaults} totalPages={10} currentPage={5} />);
    expect(screen.getAllByText("...").length).toBe(2);
  });

  it("shows ellipsis for 10 pages at page 1", () => {
    render(<Pagination {...defaults} totalPages={10} currentPage={1} />);
    expect(screen.getByText("...")).toBeInTheDocument();
  });

  it("shows all pages when <= 5", () => {
    render(<Pagination {...defaults} totalPages={3} />);
    expect(screen.queryByText("...")).not.toBeInTheDocument();
  });

  it("disables all buttons when loading", () => {
    render(<Pagination {...defaults} loading={true} />);
    expect(screen.getByLabelText("Previous page")).toBeDisabled();
    expect(screen.getByLabelText("Next page")).toBeDisabled();
  });

  it("handles zero totalItems", () => {
    render(<Pagination {...defaults} totalItems={0} />);
    expect(screen.queryByText(/\(0 total\)/)).not.toBeInTheDocument();
  });
});
