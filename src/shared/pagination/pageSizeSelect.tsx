import { useId } from "react";
import Form from "react-bootstrap/Form";

type Props = {
  value: number;
  onChange: (size: number) => void;
  options?: number[];
  label?: string;
  size?: "sm" | "lg";
  width?: number | string;
  className?: string;
  id?: string;
};

export default function PageSizeSelect({
  value,
  onChange,
  options = [5, 10, 25, 50],
  label = "Rader per sida",
  size = "sm",
  width = 110,
  className = "",
  id,
}: Props) {
  const autoId = useId();
  const selectId = id ?? `page-size-${autoId}`;

  return (
    <div
      className={`d-flex justify-content-end align-items-center mb-2 mt-4 ${className}`}
    >
      {label ? (
        <Form.Label htmlFor={selectId} className="mb-0 me-3">
          {label}
        </Form.Label>
      ) : (
        <span aria-hidden="true" />
      )}

      <Form.Select
        id={selectId}
        aria-label={label || "Rader per sida"}
        size={size}
        style={{ width }}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      >
        {options.map((n) => (
          <option key={n} value={n}>
            {n}
          </option>
        ))}
      </Form.Select>
    </div>
  );
}
