interface Props {
  url: string | null;
  username: string;
  size?: number; // px
  className?: string;
}

export default function Avatar({ url, username, size = 48, className = "" }: Props) {
  const initial = username?.[0]?.toUpperCase() ?? "?";

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={username}
        width={size}
        height={size}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <div
      className={`rounded-full bg-blue-600/20 border border-blue-500/20 flex items-center justify-center shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <span
        className="font-bold text-blue-400 leading-none"
        style={{ fontSize: size * 0.4 }}
      >
        {initial}
      </span>
    </div>
  );
}
