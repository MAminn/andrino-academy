export const metadata = {
  title: "Contact | Andrino Academy",
  description:
    "Contact Andrino Academy for support, questions, or partnership inquiries.",
};

export default function ContactPage() {
  return (
    <section className='max-w-xl mx-auto space-y-6'>
      <h1 className='text-3xl font-bold text-blue-700'>Contact Us</h1>
      <p className='text-gray-700'>
        Have questions or need support? Fill out the form below or email us at{" "}
        <a
          href='mailto:support@andrino.academy'
          className='text-blue-600 underline'>
          support@andrino.academy
        </a>
        .
      </p>
      <form className='space-y-4'>
        <input
          type='text'
          placeholder='Your Name'
          className='w-full border rounded px-3 py-2'
          required
        />
        <input
          type='email'
          placeholder='Your Email'
          className='w-full border rounded px-3 py-2'
          required
        />
        <textarea
          placeholder='Your Message'
          className='w-full border rounded px-3 py-2'
          rows={4}
          required></textarea>
        <button
          type='submit'
          className='bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700'>
          Send Message
        </button>
      </form>
    </section>
  );
}
