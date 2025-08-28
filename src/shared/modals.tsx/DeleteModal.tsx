import type { ReactNode } from "react";
import { Modal, Button } from "react-bootstrap";

type Props = {
  show: boolean;
  title?: string;
  message: string | ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isBusy?: boolean;
};

const DeleteConfirmModal = ({
  show,
  title = "Bekräfta borttagning",
  message,
  confirmLabel = "Ta bort",
  cancelLabel = "Avbryt",
  onConfirm,
  onCancel,
  isBusy = false,
}: Props) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>{message}</Modal.Body>

      <Modal.Footer>
        <Button className="bg-secondary" onClick={onCancel} disabled={isBusy}>
          {cancelLabel}
        </Button>

        <Button
          className="bg-danger border-0"
          onClick={onConfirm}
          disabled={isBusy}
        >
          {isBusy ? "Tar bort..." : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmModal;
