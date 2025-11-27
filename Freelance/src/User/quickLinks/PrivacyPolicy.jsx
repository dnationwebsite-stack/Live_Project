export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <h2 className="text-2xl font-semibold mb-4">Information We Collect</h2>
        <p className="text-gray-700 mb-4">
          We collect information that you provide directly to us, including
          name, email address, shipping address, and payment information.
        </p>
        <h2 className="text-2xl font-semibold mb-4">How We Use Your Information</h2>
        <p className="text-gray-700 mb-4">
          We use the information we collect to process your orders, communicate
          with you, and improve our services.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Data Protection</h2>
        <p className="text-gray-700 mb-4">
          We implement appropriate security measures to protect your personal
          information from unauthorized access.
        </p>
      </div>
    </div>
  );
}