import { Search, Home, CheckCircle, Phone, Smile } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search & Discover",
    description:
      "Browse verified hostels near your university. Filter by price, location, and amenities to find your perfect match.",
    color: "bg-secondary text-primary",
  },
  {
    icon: Home,
    step: "02",
    title: "Explore Details",
    description:
      "View high-quality photos and detailed facility information. Check amenities, location, and pricing.",
    color: "bg-secondary text-primary",
  },
  {
    icon: Phone,
    step: "03",
    title: "Contact Owner",
    description:
      "Connect directly with hostel owners via phone or email. Schedule a visit and ask any questions.",
    color: "bg-secondary text-primary",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Verify & Pay Owner",
    description:
      "Visit the hostel, verify it meets your needs, and pay directly to the hostel owner. We collect a small commission after successful payment.",
    color: "bg-secondary text-primary",
  },
  {
    icon: Smile,
    step: "05",
    title: "Move In!",
    description:
      "Receive your confirmation and move-in details. Show up to your new home stress-free and ready to study!",
    color: "bg-secondary text-primary",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Simple Process</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How HostelNG Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-base leading-relaxed">
            From searching to moving in — we've made the entire student accommodation journey simple, safe, and stress-free.
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-10 left-[calc(10%+2rem)] right-[calc(10%+2rem)] h-0.5 bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center animate-fade-up"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border shadow-card flex items-center justify-center mb-2 group-hover:border-primary transition-colors">
                    <step.icon className="w-7 h-7 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[10px] font-bold">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-base text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
