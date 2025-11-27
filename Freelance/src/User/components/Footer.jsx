import {
  FaPhoneAlt,
  FaWhatsapp,
  FaEnvelope,
  FaMapMarkerAlt,
  FaYoutube,
  FaFacebookF,
  FaInstagram,
} from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-gray-100 px-6 md:px-12 py-16">
      
      {/* GRID — Responsive */}
      <div
        className="
        grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-4 
        gap-12 
        md:gap-20 
        mb-12
      "
      >
        {/* Quick Links */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-5">Quick Links</h3>
          <nav className="space-y-3">
            {[
              { name: "Home", path: "/" },
              { name: "My Account", path: "/profile" },
              { name: "My Orders", path: "/orders" },
              { name: "Payment Policy", path: "/payment-policy" },
              { name: "Privacy Policy", path: "/privacy-policy" },
              { name: "Shipping Policy", path: "/shipping-policy" },
              { name: "Terms & Conditions", path: "/terms-conditions" },
              { name: "Contact Us", path: "/contact" },
            ].map((item, idx) => (
              <a
                key={idx}
                href={item.path}
                className="block text-gray-700 hover:text-gray-900 transition"
              >
                {item.name}
              </a>
            ))}
          </nav>
        </div>

        {/* Get In Touch */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-5">Get In Touch</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <FaPhoneAlt className="w-5 h-5 text-green-600 mt-0.5" />
              <span className="text-gray-700">8777578177</span>
            </div>
            <div className="flex items-start gap-3">
              <FaWhatsapp className="w-5 h-5 text-green-500 mt-0.5" />
              <span className="text-gray-700">8777578177</span>
            </div>
            <div className="flex items-start gap-3">
              <FaEnvelope className="w-5 h-5 text-green-600 mt-0.5" />
              <span className="text-gray-700">jbsports835@gmail.com</span>
            </div>
            <div className="flex items-start gap-3">
              <FaMapMarkerAlt className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="text-gray-700">
                <p>380 Jessore road, Madhyamgram</p>
                <p>Kolkata, West Bengal - 700129</p>
              </div>
            </div>
          </div>
        </div>

        {/* We Accept */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-5">We Accept</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "VISA", class: "text-blue-600 font-bold text-sm" },
              { label: "MASTERCARD", class: "text-red-600 font-bold text-sm" },
              { label: "UPI", class: "text-purple-600 font-bold text-xs" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="
                bg-white 
                border border-gray-300 
                rounded 
                px-3 py-2 
                flex items-center justify-center
              "
              >
                <span className={item.class}>{item.label}</span>
              </div>
            ))}

            <div className="bg-white border border-gray-300 rounded px-3 py-2">
              <span className="text-yellow-700 text-lg">💳</span>
            </div>
          </div>
        </div>

        {/* Social */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-5">Social</h3>
          <div className="space-y-3">
            <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition">
              <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center">
                <FaYoutube className="text-white text-sm" />
              </div>
              <span>Youtube</span>
            </a>
            <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition">
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center">
                <FaFacebookF className="text-white text-sm" />
              </div>
              <span>Facebook</span>
            </a>
            <a className="flex items-center gap-3 text-gray-700 hover:text-gray-900 transition">
              <div className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center">
                <FaInstagram className="text-white text-sm" />
              </div>
              <span>Instagram</span>
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="pt-8 border-t border-gray-300 flex flex-col items-center text-center">
        <p className="text-gray-400 text-sm">
          Copyright © by Boot Store 2025. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
