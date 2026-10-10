import { fireEvent, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderUI } from "../../test/utils";
import { FileDropzone } from "./file-dropzone";

const fileInput = (c: HTMLElement) => c.querySelector('input[type="file"]') as HTMLInputElement;
const pdf = (name = "a.pdf", size = 10) => new File([new Uint8Array(size)], name, { type: "application/pdf" });

describe("FileDropzone", () => {
  it("adds accepted files to the list and reports them", async () => {
    const onFilesAdded = vi.fn();
    const { container } = renderUI(<FileDropzone accept={[".pdf"]} onFilesAdded={onFilesAdded} />);
    await userEvent.upload(fileInput(container), pdf());
    expect(screen.getByText("a.pdf")).toBeInTheDocument();
    expect(onFilesAdded).toHaveBeenCalledTimes(1);
  });
  it("rejects wrong types and oversize files with messages", async () => {
    const user = userEvent.setup({ applyAccept: false });
    const { container } = renderUI(<FileDropzone accept={[".pdf"]} maxSize={5} />);
    await user.upload(fileInput(container), [new File(["x"], "x.png", { type: "image/png" }), pdf("big.pdf", 20)]);
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent("x.png: file type not allowed");
    expect(alert).toHaveTextContent("big.pdf: larger than");
    expect(screen.queryByText("big.pdf", { selector: "span" })).toBeNull();
  });
  it("accepts drops", () => {
    const { container } = renderUI(<FileDropzone />);
    const zone = screen.getByRole("button");
    fireEvent.dragEnter(zone);
    expect(zone).toHaveAttribute("data-dragging", "true");
    fireEvent.drop(zone, { dataTransfer: { files: [pdf("dropped.pdf")] } });
    expect(screen.getByText("dropped.pdf")).toBeInTheDocument();
    expect(zone).not.toHaveAttribute("data-dragging");
    expect(container).toBeTruthy();
  });
  it("removes a file", async () => {
    const onRemove = vi.fn();
    renderUI(<FileDropzone defaultValue={[{ id: "1", name: "keep.pdf" }]} onRemove={onRemove} />);
    await userEvent.click(screen.getByRole("button", { name: "Remove keep.pdf" }));
    expect(onRemove).toHaveBeenCalled();
    expect(screen.queryByText("keep.pdf")).toBeNull();
  });
  it("opens the picker from the keyboard", async () => {
    const { container } = renderUI(<FileDropzone />);
    const click = vi.spyOn(fileInput(container), "click");
    screen.getByRole("button").focus();
    await userEvent.keyboard("{Enter}");
    expect(click).toHaveBeenCalled();
  });
  it("shows upload progress and errors per file", () => {
    renderUI(
      <FileDropzone
        defaultValue={[
          { id: "1", name: "up.zip", status: "uploading", progress: 40 },
          { id: "2", name: "bad.zip", status: "error", error: "Boom" },
        ]}
      />,
    );
    expect(screen.getByRole("progressbar", { name: "up.zip upload progress" })).toHaveAttribute("aria-valuenow", "40");
    expect(screen.getByText("Boom")).toBeInTheDocument();
  });
});
