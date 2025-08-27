export const metadata = {
  title: "Plans | Andrino Academy",
  description: "Explore Andrino Academy subscription plans and pricing.",
};

export default function PlansPage() {
  return (
    <section className='max-w-3xl mx-auto space-y-8'>
      <h1 className='text-3xl font-bold text-blue-700 text-center'>
        Our Plans
      </h1>
      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='bg-white rounded-lg shadow p-6 flex flex-col items-center'>
          <h2 className='text-xl font-semibold mb-2'>Starter</h2>
          <p className='text-gray-600 mb-4'>
            Access to free courses and community forums.
          </p>
          <span className='text-2xl font-bold mb-4'>Free</span>
          <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
            Get Started
          </button>
        </div>
        <div className='bg-white rounded-lg shadow p-6 flex flex-col items-center border-2 border-blue-600'>
          <h2 className='text-xl font-semibold mb-2'>Pro</h2>
          <p className='text-gray-600 mb-4'>
            All Starter features plus live sessions and certificates.
          </p>
          <span className='text-2xl font-bold mb-4'>$19/mo</span>
          <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
            Choose Pro
          </button>
        </div>
        <div className='bg-white rounded-lg shadow p-6 flex flex-col items-center'>
          <h2 className='text-xl font-semibold mb-2'>Enterprise</h2>
          <p className='text-gray-600 mb-4'>
            Custom solutions for organizations and schools.
          </p>
          <span className='text-2xl font-bold mb-4'>Contact Us</span>
          <button className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'>
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  );
}
