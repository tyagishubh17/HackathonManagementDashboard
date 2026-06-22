export default function JudgeProfile() {
  return (
    <div className="min-h-screen p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 max-w-4xl">

        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-indigo-600 text-white flex items-center justify-center text-3xl font-bold">
            J
          </div>

          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Judge Profile
            </h1>

            <p className="text-gray-500">
              Manage your judge information
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-8">

          <div>
            <label className="text-sm text-gray-500">
              Full Name
            </label>

            <input
              type="text"
              value="Judge Name"
              readOnly
              className="w-full mt-2 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Email
            </label>

            <input
              type="email"
              value="judge@email.com"
              readOnly
              className="w-full mt-2 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Role
            </label>

            <input
              value="Judge"
              readOnly
              className="w-full mt-2 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="text-sm text-gray-500">
              Assigned Hackathons
            </label>

            <input
              value="0"
              readOnly
              className="w-full mt-2 border rounded-lg p-3"
            />
          </div>

        </div>

        <button className="mt-8 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
          Edit Profile
        </button>

      </div>
    </div>
  );
}