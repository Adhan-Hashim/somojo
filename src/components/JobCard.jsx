import { Link } from "react-router-dom";

export default function JobCard({ job, isGuest }) {
  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold text-white">{job.title}</h3>
      <p className="text-gray-300">{job.company} • {job.location}</p>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-[#5CB144] font-medium">
          ₹{job.salary}/month
        </span>

        {isGuest ? (
          <span className="text-gray-500 text-sm italic cursor-not-allowed">
            Login to View
          </span>
        ) : (
          <Link
            to="#"
            className="text-[#5CB144] font-semibold hover:underline"
          >
            View
          </Link>
        )}
      </div>
    </div>
  );
}