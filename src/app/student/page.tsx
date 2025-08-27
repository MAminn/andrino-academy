export default function StudentDashboard() {
  return (
    <section className='space-y-6'>
      <h1 className='text-3xl font-bold text-blue-700'>Student Dashboard</h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>My Courses</h2>
          <p className='text-gray-600'>Access your enrolled courses</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>Assignments</h2>
          <p className='text-gray-600'>View and submit assignments</p>
        </div>
        <div className='bg-white rounded-lg shadow p-6'>
          <h2 className='text-xl font-semibold mb-2'>Grades</h2>
          <p className='text-gray-600'>Check your progress</p>
        </div>
      </div>
    </section>
  );
}
