import { COMPANY_NAME } from '@constants/index';

const footerLinks = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Terms of Service', href: '#' },
  { label: 'Accessibility', href: '#' },
  { label: 'Contact', href: '#' },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="px-12 py-5 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm text-slate-500">
          &copy; {currentYear} {COMPANY_NAME}. All rights reserved.
        </p>
        <nav className="flex gap-6">
          {footerLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-sm text-slate-600 hover:text-emerald-600 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
