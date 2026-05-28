import { Camera } from "lucide-react";

type UploadButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

export function UploadButton({ onClick, disabled }: UploadButtonProps) {
  return (
    <button
      className="fixed bottom-5 left-1/2 z-20 flex h-14 -translate-x-1/2 items-center gap-3 rounded-full bg-violet px-6 text-base font-black text-white shadow-lift transition active:scale-95 disabled:cursor-not-allowed disabled:bg-ink/30 sm:hidden"
      onClick={onClick}
      disabled={disabled}
    >
      <Camera size={22} />
      Subir foto
    </button>
  );
}
