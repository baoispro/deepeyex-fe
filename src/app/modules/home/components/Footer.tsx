import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-3">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex flex-col md:flex-row justify-between items-center">
        <p>
          &copy; 2025 DeepEyeX.{" "}
          {/* {language === "vi" ? "Bảo lưu mọi quyền." : "All rights reserved."} */}
        </p>
        <div className="flex space-x-6 mt-4 md:mt-0">
          <Link href="#" className="hover:text-white transition">
            Facebook
          </Link>
          <Link href="#" className="hover:text-white transition">
            Twitter
          </Link>
          <Link href="#" className="hover:text-white transition">
            LinkedIn
          </Link>
        </div>
      </div>
    </footer>
  );
}
