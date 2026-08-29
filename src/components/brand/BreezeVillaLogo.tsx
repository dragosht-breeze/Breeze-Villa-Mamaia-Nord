import Image from "next/image";

type BreezeVillaLogoProps = {
  variant?: "navbar" | "footer" | "mark";
  className?: string;
  priority?: boolean;
};

export default function BreezeVillaLogo({
  variant = "navbar",
  className = "",
  priority = false,
}: BreezeVillaLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/branding/breeze-villa-mark.png"
        alt="Breeze Villa Mamaia Nord"
        width={420}
        height={310}
        priority={priority}
        className={`h-auto w-full object-contain ${className}`}
      />
    );
  }

  if (variant === "navbar") {
    return (
      <div className={`relative h-full w-full overflow-hidden ${className}`}>
        <Image
          src="/branding/breeze-villa-logo.png"
          alt="Breeze Villa Mamaia Nord"
          fill
          priority={priority}
          sizes="160px"
          className="scale-[1.6] object-contain"
        />
      </div>
    );
  }

  return (
    <Image
      src="/branding/breeze-villa-logo.png"
      alt="Breeze Villa Mamaia Nord"
      width={720}
      height={1040}
      priority={priority}
      className={`h-64 w-56 object-contain md:h-80 md:w-72 lg:h-[22rem] lg:w-[19rem] ${className}`}
    />
  );
}