type ToastProps = {
  tone: "success" | "error";
  title: string;
  message: string;
  onDismiss: () => void;
};

export function Toast({ tone, title, message, onDismiss }: ToastProps) {
  return (
    <section className={`toast toast--${tone}`} role="status" aria-live="polite">
      <div className="toast__content">
        <p className="toast__title">{title}</p>
        <p className="supporting-copy">{message}</p>
      </div>
      <button className="text-button" type="button" onClick={onDismiss}>
        Dismiss
      </button>
    </section>
  );
}
