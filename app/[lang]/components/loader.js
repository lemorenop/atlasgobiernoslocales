export default function Loader({height='screen'}) {
  return (
    <div className={`flex flex-col justify-center items-center text-black bg-white min-h-${height}`}>
    <span className="loader" />
  </div>
  );
}
