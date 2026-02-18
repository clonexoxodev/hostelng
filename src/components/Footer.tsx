import { Link } from "react-router-dom";
import { Building2, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-primary-foreground">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-lg">H</span>
              </div>
              <span className="font-display font-bold text-xl text-primary-foreground">HostelNG</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mb-6">
              Nigeria's most trusted platform for student hostel discovery and booking. Connecting students with verified, quality accommodation near their universities.
            </p>
            <div className="flex gap-3">
              {[Facebook, Twitter, Instagram, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-primary-foreground/10 hover:bg-primary transition-colors flex items-center justify-center"
                >
                  <Icon className="w-4 h-4 text-primary-foreground/80" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-bold text-sm mb-5 text-primary-foreground">For Students</h4>
            <ul className="space-y-3">
              {["Browse Hostels", "How It Works", "Pricing & Fees", "Student FAQs", "Safety Tips"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Hostel Owners */}
          <div>
            <h4 className="font-display font-bold text-sm mb-5 text-primary-foreground">For Hostel Owners</h4>
            <ul className="space-y-3">
              {["List Your Hostel", "Owner Dashboard", "Verification Process", "Commission Model", "Owner FAQs"].map((item) => (
                <li key={item}>
                  <Link to="#" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-bold text-sm mb-5 text-primary-foreground">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-primary-foreground/60 text-sm">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-accent" />
                <span>14 Victoria Island, Lagos, Nigeria</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/60 text-sm">
                <Phone className="w-4 h-4 shrink-0 text-accent" />
                <span>+234 800 HOSTELNG</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/60 text-sm">
                <Mail className="w-4 h-4 shrink-0 text-accent" />
                <span>hello@hostelng.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-xs">
            © 2025 HostelNG. All rights reserved. Made with ❤️ for Nigerian students.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Use", "Cookie Policy"].map((item) => (
              <Link key={item} to="#" className="text-primary-foreground/40 hover:text-primary-foreground/70 text-xs transition-colors">
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
