import { FaPhoneAlt, FaWhatsapp, FaEnvelope, FaMapMarkerAlt, FaHome, FaYoutube, FaFacebookF, FaInstagram } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 px-12 py-16 flex flex-col">
      <div className="grid grid-cols-4 gap-24 mb-12">
        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Quick Links</h3>
          <nav className="space-y-3">
            {[
              "Home",
              "My Account",
              "My Orders",
              "About Us",
              "Payment Policy",
              "Privacy Policy",
              "Return & Refund Policy",
              "Shipping Policy",
              "Terms & Conditions",
              "Contact Us",
            ].map((item, idx) => (
              <a
                key={idx}
                href="#"
                className="block text-gray-700 hover:text-gray-900 transition"
              >
                {item}
              </a>
            ))}
          </nav>
        </div>

        {/* Get In Touch */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Get In Touch</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FaPhoneAlt className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">8777578177</span>
            </div>
            <div className="flex items-start gap-3">
              <FaWhatsapp className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">8777578177</span>
            </div>
            <div className="flex items-start gap-3">
              <FaEnvelope className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-gray-700">jbsports835@gmail.com</span>
            </div>
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-gray-700">
                <div>380 Jessore road, Madhyamgram</div>
                <div>Kolkata, West Bengal - 700129</div>
              </div>
            </div>
          </div>
        </div>

        {/* We Accept */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6">We Accept</h3>
          <div className="flex flex-wrap gap-3">
            <div className="bg-white border border-gray-300 rounded px-3 py-2 flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">VISA</span>
            </div>
            <div className="bg-white border border-gray-300 rounded px-3 py-2 flex items-center justify-center">
              <span className="text-red-600 font-bold text-sm">MASTERCARD</span>
            </div>
            <div className="bg-white border border-gray-300 rounded px-3 py-2 flex items-center justify-center">
              <span className="text-purple-600 font-bold text-xs">UPI</span>
            </div>
            <div className="bg-white border border-gray-300 rounded px-3 py-2 flex items-center justify-center">
              <span className="text-yellow-700 text-lg">💳</span>
            </div>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-6">Social</h3>
          <div className="space-y-3">
            <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <FaYoutube className="text-white text-sm" />
              </div>
              <span>Youtube</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <FaFacebookF className="text-white text-sm" />
              </div>
              <span>Facebook</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition">
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                <FaInstagram className="text-white text-sm" />
              </div>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="flex flex-col items-center gap-6 pt-8 border-t border-gray-300">
        <p className="text-gray-400 text-sm">
          Copyright © by Boot Store 2025. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
