export default function ShippingPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Shipping Policy – Drip Nation</h1>

      <div className="prose max-w-none">
        <p className="text-gray-700 mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        {/* Shipping Time */}
        <h2 className="text-2xl font-semibold mb-2">Shipping Time</h2>
        <p className="text-gray-700 mb-4">
          Orders are dispatched within <strong>3–4 working days</strong>.
        </p>
        <p className="text-gray-700 mb-4">
          Delivery time: <strong>5–9 working days</strong> depending on your location.
        </p>
        <p className="text-gray-600 mb-6">
          (Delays may occur during festivals, sales, or unexpected situations.)
        </p>

        {/* Shipping Charges */}
        <h2 className="text-2xl font-semibold mb-2">Shipping Charges</h2>
        <p className="text-gray-700 mb-4">
          Standard shipping charges will be calculated and displayed at checkout.
        </p>
        <p className="text-gray-700 mb-6">
          Cash on Delivery (COD) orders may include an additional fee.
        </p>

        {/* Order Tracking */}
        <h2 className="text-2xl font-semibold mb-2">Order Tracking</h2>
        <p className="text-gray-700 mb-6">
          Once your order is shipped, you will receive a tracking link via
          SMS, Email, or WhatsApp to track your package in real time.
        </p>

        {/* Incorrect Address */}
        <h2 className="text-2xl font-semibold mb-2">Incorrect Address</h2>
        <p className="text-gray-700 mb-6">
          If the shipping address provided is incorrect or incomplete, delivery
          may fail. In such cases, re-shipping charges may be applied.
        </p>

        {/* Damaged Deliveries */}
        <h2 className="text-2xl font-semibold mb-2">Damaged Deliveries</h2>
        <p className="text-gray-700 mb-6">
          If you receive a damaged package, please record a video while opening
          the parcel and contact our support team immediately for assistance.
        </p>
      </div>
    </div>
  );
}