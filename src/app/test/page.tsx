export default function ColorTest() {
  return (
    <div className='p-8 space-y-4'>
      <h2 className='text-2xl font-bold mb-6'>Andrino Academy Color Test</h2>

      {/* Test with hex values directly */}
      <div className='space-y-4'>
        <div
          style={{ backgroundColor: "#343b50" }}
          className='w-full p-4 text-white rounded text-center'>
          Navy Dark Blue (#343b50) - Direct Hex
        </div>

        <div
          style={{ backgroundColor: "#7e5b3f" }}
          className='w-full p-4 text-white rounded text-center'>
          Brown Dark Carmel (#7e5b3f) - Direct Hex
        </div>

        <div
          style={{ backgroundColor: "#c19170" }}
          className='w-full p-4 text-white rounded text-center'>
          Light Copper (#c19170) - Direct Hex
        </div>
      </div>

      {/* Test with brand classes */}
      <div className='space-y-4 mt-8'>
        <h3 className='text-lg font-semibold'>Testing Brand Classes:</h3>
        <div className='bg-brand-blue w-full p-4 text-white rounded text-center'>
          Navy Dark Blue - bg-brand-blue class
        </div>

        <div className='bg-brand-brown w-full p-4 text-white rounded text-center'>
          Brown Dark Carmel - bg-brand-brown class
        </div>

        <div className='bg-brand-copper w-full p-4 text-white rounded text-center'>
          Light Copper - bg-brand-copper class
        </div>
      </div>

      {/* Test with standard Tailwind colors to ensure Tailwind is working */}
      <div className='space-y-4 mt-8'>
        <h3 className='text-lg font-semibold'>Testing Standard Tailwind:</h3>
        <div className='bg-blue-500 w-full p-4 text-white rounded text-center'>
          Standard Blue-500
        </div>

        <div className='bg-red-500 w-full p-4 text-white rounded text-center'>
          Standard Red-500
        </div>

        <div className='bg-green-500 w-full p-4 text-white rounded text-center'>
          Standard Green-500
        </div>
      </div>
    </div>
  );
}
