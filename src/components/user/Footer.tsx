export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12 mt-20 w-full">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-10">

        <div>
          <h2 className="text-2xl font-bold text-white">Qicktick</h2>
          <p className="mt-3 text-sm text-gray-400">
            Bringing trusted services to your doorstep.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Quick Links</h3>
          <ul className="mt-3 space-y-2">
            <li><a href="/" className="hover:text-white">Home</a></li>
            <li><a href="/categories" className="hover:text-white">Categories</a></li>
            <li><a href="/about" className="hover:text-white">About Us</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Support</h3>
          <ul className="mt-3 space-y-2">
            <li><a href="/contact" className="hover:text-white">Contact Us</a></li>
            <li><a href="/faq" className="hover:text-white">FAQ</a></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li>Email: support@qicktick.com</li>
            <li>Phone: +91 98765 43210</li>
          </ul>
        </div>

      </div>

      <div className="border-t border-gray-700 mt-10 pt-5">
        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Qicktick. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
