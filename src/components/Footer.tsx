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
              <img 
                src="/logo.png" 
                alt="HostelNG Logo" 
                className="w-9 h-9 object-contain"
              />
              <span className="font-display font-bold text-xl text-primary-foreground">HostelNG</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed mb-6">
              Nigeria's most trusted platform for student hostel discovery. Connecting students with quality accommodation near their universities.
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
            <h4 className="font-display font-bold text-sm mb-5 text-primary-foreground">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/hostels" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  Browse Hostels
                </Link>
              </li>
              <li>
                <Link to="/faqs" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  Student FAQs
                </Link>
              </li>
              <li>
                <Link to="/safety-tips" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link to="/list-hostel" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  List Your Hostel
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Hostel Owners */}
          <div>
            <h4 className="font-display font-bold text-sm mb-5 text-primary-foreground">For Hostel Owners</h4>
            <ul className="space-y-3">
              <li>
                <Link to="/list-hostel" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  List Your Hostel
                </Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  Owner Dashboard
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-primary-foreground/60 hover:text-accent text-sm transition-colors">
                  Get Support
                </Link>
              </li>
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
                <span>+234 706 1686 123</span>
              </li>
              <li className="flex items-center gap-3 text-primary-foreground/60 text-sm">
                <Mail className="w-4 h-4 shrink-0 text-accent" />
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=Clonexoxo80@gmail.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors"
                >
                  hello@hostelng.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-primary-foreground/10 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-primary-foreground/40 text-xs">
            © 2025 HostelNG. All rights reserved.
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
