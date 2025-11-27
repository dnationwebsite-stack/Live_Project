export default function TermsConditions() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Terms & Conditions</h1>
      <div className="prose max-w-none">
        <p className="text-gray-700 mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        <h2 className="text-2xl font-semibold mb-4">Agreement to Terms</h2>
        <p className="text-gray-700 mb-4">
          By accessing our website, you agree to be bound by these Terms and
          Conditions and our Privacy Policy.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Use License</h2>
        <p className="text-gray-700 mb-4">
          Permission is granted to temporarily download one copy of the materials
          on Boot Store's website for personal, non-commercial use only.
        </p>
        <h2 className="text-2xl font-semibold mb-4">Disclaimer</h2>
        <p className="text-gray-700 mb-4">
          The materials on Boot Store's website are provided on an 'as is' basis.
          Boot Store makes no warranties, expressed or implied.
        </p>
      </div>
    </div>
  );
}