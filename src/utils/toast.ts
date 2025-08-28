import { toast, type ToastOptions } from "react-toastify";

const base: ToastOptions = {
  position: "top-center",
  autoClose: 5000,
};

export const showSuccess = (message: string, opts?: ToastOptions) =>
  toast.success(message, { ...base, ...opts });

export const showError = (message: string, opts?: ToastOptions) =>
  toast.error(message, { ...base, ...opts });
