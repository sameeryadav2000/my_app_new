import { FiUsers, FiPackage, FiDollarSign, FiPieChart } from "react-icons/fi";

export default function DashboardPage() {
  const stats = [
    {
      name: "Total Users",
      value: "2,534",
      icon: <FiUsers className="w-6 h-6 text-blue-500" />,
    },
    {
      name: "Total Products",
      value: "187",
      icon: <FiPackage className="w-6 h-6 text-green-500" />,
    },
    {
      name: "Revenue",
      value: "$45,231",
      icon: <FiDollarSign className="w-6 h-6 text-yellow-500" />,
    },
    {
      name: "Conversion Rate",
      value: "3.24%",
      icon: <FiPieChart className="w-6 h-6 text-purple-500" />,
    },
  ];

  return (
    <div className="p-6">
      <header className="bg-white shadow-sm rounded-lg p-4 mb-6">
        <h1 className="text-2xl font-bold text-[#5B4B49]">Dashboard Overview</h1>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">{stat.name}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="bg-gray-100 p-3 rounded-full">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Welcome card */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-lg font-bold text-[#5B4B49] mb-4">Welcome to the Admin Dashboard</h2>
        <p className="text-gray-600">
          This is a minimal dashboard template to get you started. Use the navigation menu on 
          the left to explore different sections of your admin portal.
        </p>
      </div>
    </div>
  );
}