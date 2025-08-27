export default function InstructorDashboard() {
  return (
    <section className='space-y-6'>
      <h1 className='text-3xl font-bold text-blue-700'>Instructor Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>My Classes</h2>
          <p className='text-gray-600'>Manage your classes and sessions</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>Students</h2>
          <p className='text-gray-600'>View enrolled students</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>Content</h2>
          <p className='text-gray-600'>Create and manage course content</p>
        </div>
      </div>
    </section>
  );
}
