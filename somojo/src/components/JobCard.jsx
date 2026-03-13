import { Link } from "react-router-dom";
import { useThemeColor } from "../hooks/useThemeColor";

export default function JobCard({ job, isGuest, isSaved, hasApplied, onSave }) {
  const { themeText } = useThemeColor();

  return (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow hover:shadow-lg transition relative">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-white">{job.title}</h3>
          <p className="text-gray-300">{job.company} • {job.location}</p>
        </div>
        {!isGuest && (
          <button
            onClick={() => onSave && onSave(job._id || job.id)}
            className={`text-2xl transition-colors ${isSaved ? themeText : 'text-gray-500 hover:text-white'}`}
            title={isSaved ? "Unsave Job" : "Save Job"}
          >
            {isSaved ? '★' : '☆'}
          </button>
        )}
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className={`text-sm ${themeText} font-medium`}>
          ₹{job.salary || job.basePay || 'Not specified'}/month
        </span>

        {isGuest ? (
          <span className="text-gray-500 text-sm italic cursor-not-allowed">
            Login to View
          </span>
        ) : hasApplied ? (
          <span className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
            Applied
          </span>
        ) : (
          <Link
            to={`/apply/${job._id || job.id}`}
            className={`${themeText} font-semibold hover:underline`}
          >
            View & Apply
          </Link>
        )}
      </div>
    </div>
  );
}