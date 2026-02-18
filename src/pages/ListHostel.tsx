import { Link } from "react-router-dom";
import { CheckCircle2, Upload, Building2, Camera, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const steps = [
  { icon: FileText, title: "Fill Basic Details", desc: "Enter your hostel name, location, university proximity, and contact information." },
  { icon: Camera, title: "Upload Photos", desc: "Add high-quality photos of your rooms, facilities, and compound to attract students." },
  { icon: Building2, title: "Set Room Types & Prices", desc: "Define room categories, pricing per year, and available units for each type." },
  { icon: CheckCircle2, title: "Get Verified", desc: "Our team reviews and inspects your listing. Approved hostels go live within 48 hours." },
];

const perks = [
  "Free to list — no upfront costs",
  "Commission only on successful bookings",
  "Reach thousands of university students",
  "Secure payment — funds paid directly to you",
  "Dedicated account manager support",
  "Analytics dashboard to track enquiries",
];

const ListHostel = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <div className="pt-28 pb-16 gradient-primary">
        <div className="container mx-auto px-4 text-center">
          <Building2 className="w-14 h-14 text-primary-foreground/70 mx-auto mb-5" />
          <h1 className="font-display text-3xl md:text-5xl font-bold text-primary-foreground mb-4">
            List Your Hostel on HostelNG
          </h1>
          <p className="text-primary-foreground/80 max-w-xl mx-auto text-base leading-relaxed">
            Join 200+ verified hostel owners reaching thousands of Nigerian university students. Listing is completely free — we only earn when you earn.
          </p>
        </div>
      </div>

      {/* Steps */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="section-label mb-2">Getting Started</p>
            <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">How to List Your Hostel</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {steps.map((step, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border p-6 text-center card-hover">
                <div className="w-12 h-12 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
                  <step.icon className="w-6 h-6 text-primary" />
                </div>
                <span className="section-label text-[10px] mb-2 block">Step {i + 1}</span>
                <h3 className="font-display font-bold text-base text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          {/* Benefits + Form CTA */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="font-display font-bold text-xl text-foreground mb-6">Why List on HostelNG?</h3>
              <ul className="space-y-3 mb-8">
                {perks.map((perk, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground text-sm">{perk}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-secondary rounded-xl p-4">
                <p className="text-sm font-semibold text-foreground mb-1">Commission Model</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  We charge a small commission only when a student completes payment for your hostel. No listing fees, no subscription — just results-based partnership.
                </p>
              </div>
            </div>

            {/* Registration Form */}
            <div className="bg-card rounded-2xl border border-border p-8">
              <h3 className="font-display font-bold text-xl text-foreground mb-2">Register Your Hostel</h3>
              <p className="text-muted-foreground text-sm mb-6">Fill in the form below and our team will contact you within 24 hours.</p>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label className="section-label text-[10px] block mb-1.5">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Emeka Okafor"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-1.5">Hostel Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Greenview Student Lodge"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-1.5">Nearest University</label>
                  <input
                    type="text"
                    placeholder="e.g. University of Lagos"
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="section-label text-[10px] block mb-1.5">Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+234..."
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                  </div>
                  <div>
                    <label className="section-label text-[10px] block mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="you@email.com"
                      className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground"
                    />
                  </div>
                </div>
                <div>
                  <label className="section-label text-[10px] block mb-1.5">Hostel Address</label>
                  <textarea
                    placeholder="Full address of the hostel..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm text-foreground outline-none focus:border-primary transition-colors placeholder:text-muted-foreground resize-none"
                  />
                </div>

                <Button type="submit" className="w-full gradient-primary border-0 shadow-primary text-primary-foreground font-semibold h-12" size="lg">
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Listing Request
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  By submitting, you agree to our Terms of Service & Commission Policy.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ListHostel;
