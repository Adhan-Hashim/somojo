import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] text-center">
      <h1 className="text-5xl font-bold mb-6">
        Find Local Part-Time Jobs Near You
      </h1>

      <p className="text-gray-600 mb-6 max-w-xl">
        SOMOJO connects students and part-time workers with nearby
        businesses hiring immediately.
      </p>

      <button
        onClick={() => navigate("/dashboard")}
        className="bg-primary text-white px-6 py-3 rounded-xl text-lg hover:opacity-90 transition"
      >
        Explore Jobs
      </button>
    </div>
  );
}