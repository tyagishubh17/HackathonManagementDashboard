export default function SuperAdminProfile() {
  return (
    <div className="min-h-screen p-6">
      <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow p-8">

        {/* Header */}
        <div className="flex items-center gap-6 border-b pb-6">

          <div className="w-24 h-24 rounded-full bg-red-600 text-white flex items-center justify-center text-3xl font-bold">
            SA
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Super Admin Profile
            </h1>

            <p className="text-gray-500 mt-1">
              Manage administrator account details
            </p>
          </div>

        </div>

        {/* Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Full Name
            </label>

            <input
              value="Super Admin"
              readOnly
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Email
            </label>

            <input
              value="admin@email.com"
              readOnly
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Role
            </label>

            <input
              value="Super Admin"
              readOnly
              className="w-full border rounded-xl p-3"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2">
              Managed Users
            </label>

            <input
              value="0"
              readOnly
              className="w-full border rounded-xl p-3"
            />
          </div>

        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mt-8">

          <div className="bg-blue-50 rounded-xl p-5">
            <h3 className="text-gray-500 text-sm">
              Total Users
            </h3>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="bg-green-50 rounded-xl p-5">
            <h3 className="text-gray-500 text-sm">
              Active Hackathons
            </h3>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

          <div className="bg-purple-50 rounded-xl p-5">
            <h3 className="text-gray-500 text-sm">
              Pending Requests
            </h3>

            <p className="text-3xl font-bold mt-2">
              0
            </p>
          </div>

        </div>

        <button className="mt-8 px-6 py-3 rounded-xl bg-red-600 text-white hover:bg-red-700">
          Edit Profile
        </button>

      </div>
    </div>
  );
}