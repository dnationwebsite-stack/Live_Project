export default function Contact() {
  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Get In Touch</h2>
          <div className="space-y-4">
            <p><strong>Phone:</strong> 8777578177</p>
            <p><strong>WhatsApp:</strong> 8777578177</p>
            <p><strong>Email:</strong> jbsports835@gmail.com</p>
            <p><strong>Address:</strong><br />
              380 Jessore road, Madhyamgram<br />
              Kolkata, West Bengal - 700129
            </p>
          </div>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-4">Send us a Message</h2>
          <form className="space-y-4">
            <input
              type="text"
              placeholder="Your Name"
              className="w-full px-4 py-2 border rounded"
            />
            <input
              type="email"
              placeholder="Your Email"
              className="w-full px-4 py-2 border rounded"
            />
            <textarea
              placeholder="Your Message"
              rows="4"
              className="w-full px-4 py-2 border rounded"
            />
            <button className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
