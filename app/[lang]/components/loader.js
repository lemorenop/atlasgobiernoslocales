export default function Loader({ className }) {
  return (
    <div
      className={`flex flex-col justify-center items-center text-black ${className}`}
    >
      <span className="loader" />
    </div>
  );
}
