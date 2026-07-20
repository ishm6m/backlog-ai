import { toast } from "sonner";

export async function runAction(
  action: () => Promise<unknown>,
  message: string,
  undo?: () => Promise<unknown>
) {
  try {
    await action();
  } catch {
    toast.error("That didn't save — check your connection and try again.");
    return false;
  }
  toast.success(
    message,
    undo && {
      action: {
        label: "Undo",
        onClick: () => {
          undo().catch(() => toast.error("Couldn't undo — fix it from the pipeline."));
        },
      },
    }
  );
  return true;
}
