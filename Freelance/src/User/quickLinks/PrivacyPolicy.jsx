export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy – Drip Nation</h1>

      <div className="prose max-w-none">

        {/* Information We Collect */}
        <h2 className="text-2xl font-semibold mb-2">Information We Collect</h2>
        <p className="text-gray-700 mb-2">
          We collect the following data to improve your shopping experience:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-6">
          <li>Name, email, and phone number</li>
          <li>Shipping and billing address</li>
          <li>Order and transaction details</li>
          <li>Device data, cookies, and browsing activity</li>
        </ul>

        {/* How We Use */}
        <h2 className="text-2xl font-semibold mb-2">How We Use Your Information</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-6">
          <li>To process and deliver your orders</li>
          <li>To improve customer service and support</li>
          <li>For marketing, offers, and updates (only with your consent)</li>
          <li>To enhance website performance and security</li>
        </ul>

        {/* Data Protection */}
        <h2 className="text-2xl font-semibold mb-2">Data Protection</h2>
        <ul className="list-disc pl-6 text-gray-700 mb-6">
          <li>We do not sell or share your personal information</li>
          <li>Payments are processed through secure, encrypted gateways</li>
          <li>We do not store your card or banking details</li>
        </ul>

        {/* Third Party */}
        <h2 className="text-2xl font-semibold mb-2">Third-Party Sharing</h2>
        <p className="text-gray-700 mb-2">
          We share limited data only with trusted partners:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-6">
          <li>Courier partners (for shipping)</li>
          <li>Payment gateways (for transaction processing)</li>
        </ul>

        {/* Rights */}
        <h2 className="text-2xl font-semibold mb-2">Your Rights</h2>
        <p className="text-gray-700 mb-2">
          You have the right to:
        </p>
        <ul className="list-disc pl-6 text-gray-700 mb-6">
          <li>Access your personal data</li>
          <li>Request correction or deletion of your data</li>
          <li>Opt-out of marketing communications</li>
        </ul>

        {/* Contact */}
        <h2 className="text-2xl font-semibold mb-2">Contact Us</h2>
        <p className="text-gray-700 mb-6">
          For any privacy-related concerns, you can contact us at:
          <br />
          <strong>Email:</strong> dripnation55@gmail.com
        </p>
      </div>
    </div>
  );
}