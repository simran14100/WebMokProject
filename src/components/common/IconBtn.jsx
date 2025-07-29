export default function IconBtn({
  text,
  onclick,
  children,
  disabled,
  outline = false,
  customClasses,
  type,
}) {
  return (
    <button
      disabled={disabled}
      onClick={onclick}
      className={`flex items-center ${
        outline ? "border border-green-600 bg-transparent text-green-600 hover:bg-green-50" : "bg-green-600 text-white hover:bg-green-700"
      } cursor-pointer gap-x-2 rounded-md py-2 px-5 font-semibold transition-colors ${customClasses}`}
      type={type}
    >
      {children ? (
        <>
          <span>{text}</span>
          {children}
        </>
      ) : (
        text
      )}
    </button>
  );
}
  