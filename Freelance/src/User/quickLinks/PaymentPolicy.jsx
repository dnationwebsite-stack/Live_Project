export default function PaymentPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Payment Policy</h1>
      <div className="prose max-w-none">
        <h2 className="text-2xl font-semibold mb-4">Accepted Payment Methods</h2>
        <p className="text-gray-700 mb-4">
          We accept the following payment methods:
        </p>
        <ul className="list-disc pl-6 mb-4 text-gray-700">
          <li>Credit Cards (Visa, Mastercard)</li>
          <li>Debit Cards</li>
          <li>UPI</li>
          <li>Net Banking</li>
        </ul>
        <h2 className="text-2xl font-semibold mb-4">Payment Security</h2>
        <p className="text-gray-700 mb-4">
          All payment transactions are secured and encrypted. We do not store
          your card details on our servers.
        </p>
      </div>
    </div>
  );
}

