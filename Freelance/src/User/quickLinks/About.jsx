export default function About() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">About Us</h1>
      <div className="prose max-w-none">
        <p className="text-lg text-gray-700 mb-4">
          Welcome to Boot Store - your trusted destination for premium footwear.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
        <p className="text-gray-700 mb-4">
          Founded with a passion for quality footwear, Boot Store has been serving
          customers with the finest selection of boots and shoes.
        </p>
        <h2 className="text-2xl font-semibold mt-8 mb-4">Our Mission</h2>
        <p className="text-gray-700 mb-4">
          To provide our customers with high-quality footwear that combines style,
          comfort, and durability.
        </p>
      </div>
    </div>
  );
}
