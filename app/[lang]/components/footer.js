import { getDictionary } from '@/app/i18n.config';

export default async function Footer({ lang }) {
  const dict = await getDictionary(lang);
  
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {dict.footer?.about || 'About Us'}
            </h3>
            <p className="text-gray-300">
              {dict.footer?.aboutText || 'Information about the company or project.'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {dict.footer?.contact || 'Contact'}
            </h3>
            <p className="text-gray-300">
              {dict.footer?.contactText || 'Contact information and details.'}
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">
              {dict.footer?.followUs || 'Follow Us'}
            </h3>
            <div className="flex space-x-4">
              {/* Add social media links here */}
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-700 pt-8 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} {dict.footer?.copyright || 'Your Company Name'}. {dict.footer?.rights || 'All rights reserved.'}
          </p>
        </div>
      </div>
    </footer>
  );
} 