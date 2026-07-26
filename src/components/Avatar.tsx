interface Props {
  name: string;
  color: string;
  logo: string;
  size?: number;
}

/** Brand-colored monogram avatar for a service */
export default function Avatar({ name, color, logo, size = 44 }: Props) {
  const letters = logo || name.slice(0, 2);
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl font-semibold text-white shadow-sm"
      style={{
        width: size,
        height: size,
        background: color,
        fontSize: size * 0.36,
      }}
      aria-hidden
    >
      {letters}
    </div>
  );
}
