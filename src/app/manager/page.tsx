export default function ManagerDashboard() {
  return (
    <section className='space-y-6'>
      <h1 className='text-3xl font-bold text-blue-700'>Manager Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>Analytics</h2>
          <p className='text-gray-600'>Platform performance and metrics</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>Users</h2>
          <p className='text-gray-600'>Manage all platform users</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>Settings</h2>
          <p className='text-gray-600'>Platform configuration</p>
        </div>
      </div>
    </section>
  );
}
