import JobCard from "../components/JobCard";

const jobs = [
  {
    id: 1,
    title: "Cafe Assistant",
    company: "Urban Brew",
    location: "Chennai",
    salary: 12000,
  },
  {
    id: 2,
    title: "Delivery Executive",
    company: "QuickDrop",
    location: "Chennai",
    salary: 15000,
  },
];

export default function Dashboard() {
  return (
    <div className="grid grid-cols-4 gap-6 p-6">
      <div className="col-span-1 bg-white p-4 rounded-2xl shadow">
        <h2 className="font-semibold mb-3">Your Panel</h2>
        <ul className="space-y-2 text-gray-600">
          <li>Saved Jobs</li>
          <li>Applied Jobs</li>
          <li>Nearby Jobs</li>
        </ul>
      </div>

      <div className="col-span-3 space-y-4">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
}