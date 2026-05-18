type AdminAlertProps = {
  type: "success" | "error" | "info" | "warning";
  children: React.ReactNode;
};

export function AdminAlert({ type, children }: AdminAlertProps) {
  const styles: Record<AdminAlertProps["type"], string> = {
    success: "border-green-200 bg-green-50 text-green-700",
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return (
    <div
      className={`mb-5 rounded-2xl border px-5 py-4 text-sm font-bold leading-7 ${styles[type]}`}
    >
      {children}
    </div>
  );
}