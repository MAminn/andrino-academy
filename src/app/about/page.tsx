export const metadata = {
  title: "About | Andrino Academy",
  description: "Learn more about Andrino Academy, our mission, and our team.",
};

export default function AboutPage() {
  return (
    <section className='max-w-2xl mx-auto space-y-6'>
      <h1 className='text-3xl font-bold text-blue-700'>
        About Andrino Academy
      </h1>
      <p className='text-gray-700'>
        Andrino Academy is dedicated to providing high-quality online education
        for students and professionals. Our mission is to make learning
        accessible, engaging, and effective for everyone.
      </p>
      <p className='text-gray-700'>
        Our team consists of experienced educators, technologists, and support
        staff who are passionate about helping you succeed.
      </p>
    </section>
  );
}
