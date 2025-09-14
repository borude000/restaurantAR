import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider duration={2500}>
      {toasts.map(function ({ id, title, description, action, ...props }) {
        const duration = (props as any)?.duration ?? 2500
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (
                <ToastDescription>{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
            {/* Progress bar */}
            <div
              className="pointer-events-none absolute left-0 bottom-0 h-1 w-full origin-left bg-primary/80 animate-toast-progress"
              style={{ animationDuration: `${duration}ms` }}
            />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
