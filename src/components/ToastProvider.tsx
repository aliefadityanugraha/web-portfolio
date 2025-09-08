import {
  createSignal,
  createContext,
  useContext,
  onCleanup,
  type Component,
  type JSX,
} from "solid-js";
import { For } from "solid-js";
import { FiCheck, FiX, FiInfo, FiAlertTriangle } from "solid-icons/fi";
import { cn } from "@/libs/cn";

type ToastType = "success" | "error" | "info" | "warning";

type Toast = {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
};

type ToastContextType = {
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
};

const ToastContext = createContext<ToastContextType>();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    return {
      addToast: () => {},
      removeToast: () => {},
    } as ToastContextType;
  }
  return context;
};

const ToastItem: Component<{ toast: Toast; onRemove: (id: string) => void }> = (
  props,
) => {
  let timeoutId: number;

  const duration = props.toast.duration || 5000;

  if (typeof window !== "undefined") {
    timeoutId = window.setTimeout(() => {
      props.onRemove(props.toast.id);
    }, duration);
  }

  onCleanup(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });

  const getIcon = () => {
    switch (props.toast.type) {
      case "success":
        return <FiCheck class="w-5 h-5" />;
      case "error":
        return <FiX class="w-5 h-5" />;
      case "warning":
        return <FiAlertTriangle class="w-5 h-5" />;
      default:
        return <FiInfo class="w-5 h-5" />;
    }
  };

  const getColorClasses = () => {
    switch (props.toast.type) {
      case "success":
        return "bg-green-50 border-green-200 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-200";
      case "error":
        return "bg-red-50 border-red-200 text-red-800 dark:bg-red-900/20 dark:border-red-800 dark:text-red-200";
      case "warning":
        return "bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-200";
      default:
        return "bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-200";
    }
  };

  return (
    <div
      class={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300",
        getColorClasses(),
      )}
    >
      <div class="flex-shrink-0 mt-0.5">{getIcon()}</div>
      <div class="flex-1 min-w-0">
        <p class="font-medium text-sm">{props.toast.title}</p>
        {props.toast.description && (
          <p class="text-sm opacity-90 mt-1">{props.toast.description}</p>
        )}
      </div>
      <button
        onClick={() => props.onRemove(props.toast.id)}
        class="flex-shrink-0 opacity-60 hover:opacity-100 transition-opacity"
        aria-label="Close notification"
      >
        <FiX class="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastProvider: Component<{ children: JSX.Element }> = (props) => {
  const [toasts, setToasts] = createSignal<Toast[]>([]);

  // Muat toast dari sessionStorage saat komponen dimuat
  if (typeof window !== "undefined") {
    const loadToastsFromStorage = () => {
      const savedToasts = JSON.parse(sessionStorage.getItem("toasts") || "[]");
      if (savedToasts.length > 0) {
        setToasts(savedToasts);
      }
    };

    // Muat toast saat inisialisasi
    loadToastsFromStorage();

    // Tambahkan event listener untuk astro:page-load
    document.addEventListener("astro:page-load", loadToastsFromStorage);

    // Bersihkan event listener saat komponen dibersihkan
    onCleanup(() => {
      document.removeEventListener("astro:page-load", loadToastsFromStorage);
    });
  }

  const addToast = (toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 11);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Simpan toast ke sessionStorage untuk persistensi saat navigasi
    if (typeof window !== "undefined") {
      const currentToasts = JSON.parse(
        sessionStorage.getItem("toasts") || "[]",
      );
      sessionStorage.setItem(
        "toasts",
        JSON.stringify([...currentToasts, newToast]),
      );
    }
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));

    // Hapus toast dari sessionStorage
    if (typeof window !== "undefined") {
      const currentToasts = JSON.parse(
        sessionStorage.getItem("toasts") || "[]",
      );
      sessionStorage.setItem(
        "toasts",
        JSON.stringify(currentToasts.filter((toast: Toast) => toast.id !== id)),
      );
    }
  };

  const contextValue: ToastContextType = {
    addToast,
    removeToast,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {props.children}

      {/* Toast Container */}
      <div class="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full">
        <For each={toasts()}>
          {(toast) => <ToastItem toast={toast} onRemove={removeToast} />}
        </For>
      </div>
    </ToastContext.Provider>
  );
};
