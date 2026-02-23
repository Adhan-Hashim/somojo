import { Link } from "react-router-dom";

export default function JobCard({ job }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition">
      <h3 className="text-lg font-semibold">{job.title}</h3>
      <p className="text-gray-600">{job.company} • {job.location}</p>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-sm text-green-600 font-medium">
          ₹{job.salary}/month
        </span>

        <Link
          to="#"
          className="text-primary font-semibold hover:underline"
        >
          View
        </Link>
      </div>
    </div>
  );
}