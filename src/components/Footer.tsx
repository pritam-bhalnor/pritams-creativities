import { Heart, Github, Linkedin, Mail, Globe, Instagram, Phone } from 'lucide-react';

export const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-gray-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 items-center">
          
          {/* Brand & Tagline */}
          <div className="text-center md:text-left space-y-3">
            <h3 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-600 dark:from-primary-400 dark:to-purple-400">
              Pritam's Creativities
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mx-auto md:mx-0">
              Crafting distinct digital solutions for complex calculation needs. Simple, precise, and beautiful.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2 pt-2">
              <div className="p-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-300">+91 7666112325</span>
            </div>
          </div>

          {/* Social Links */}
          <div className="flex justify-center gap-4">
            {[
              { icon: Github, href: "#", label: "GitHub" },
              { icon: Linkedin, href: "#", label: "LinkedIn" },
              { icon: Instagram, href: "#", label: "Instagram" },
              { icon: Mail, href: "mailto:pritam.bhalnor.k@gmail.com", label: "Email" }
            ].map((social, idx) => (
              <a
                key={idx}
                href={social.href}
                className="p-2.5 rounded-xl bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:text-white hover:bg-primary-500 dark:hover:bg-primary-600 transform hover:-translate-y-1 transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary-500/20"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Copyright & Credit */}
          <div className="text-center md:text-right space-y-2">
            <div className="flex items-center justify-center md:justify-end gap-2 text-sm font-medium text-gray-600 dark:text-gray-300">
              <span>Developed with</span>
              <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-[pulse_3s_ease-in-out_infinite]" />
              <span>by Pritam</span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              © {currentYear} All rights reserved.
            </p>
          </div>
          
        </div>
      </div>
    </footer>
  );
};
