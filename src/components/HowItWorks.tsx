import { Search, Home, Phone, CheckCircle, Smile } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search & Discover",
    description: "Browse agent-posted listings near your university. Filter by price, gender, and institution.",
  },
  {
    icon: Home,
    step: "02",
    title: "Explore Details",
    description: "View high-quality photos, full descriptions, and all the details you need to decide.",
  },
  {
    icon: Phone,
    step: "03",
    title: "Contact Agent",
    description: "Submit a quick inquiry to unlock the agent's contact details. No spam, no middlemen.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Visit & Confirm",
    description: "Schedule a visit, confirm the property meets your needs, then pay directly to the owner.",
  },
  {
    icon: Smile,
    step: "05",
    title: "Move In",
    description: "Get your keys and settle into your new home — stress-free and ready to study.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-24 gradient-subtle">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <p className="section-label mb-3">Simple Process</p>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How HostelNG Works
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed">
            From searching to moving in — we've made the entire student accommodation journey simple, safe, and stress-free.
          </p>
        </div>

        <div className="relative max-w-5xl mx-auto">
          {/* Connector line (desktop) */}
          <div className="hidden lg:block absolute top-8 left-[10%] right-[10%] h-px bg-gradient-to-r from-transparent via-border to-transparent" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center text-center animate-fade-up"
                style={{ animationDelay: `${idx * 0.08}s` }}
              >
                {/* Icon circle */}
                <div className="relative mb-5 z-10">
                  <div className="w-16 h-16 rounded-2xl bg-card border-2 border-border shadow-card flex items-center justify-center">
                    <step.icon className="w-6 h-6 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-[9px] font-bold shadow-primary">
                    {step.step}
                  </span>
                </div>
                <h3 className="font-display font-bold text-sm text-foreground mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-xs leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
