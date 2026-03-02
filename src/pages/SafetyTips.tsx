import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Shield, Eye, FileCheck, Users, AlertTriangle, CheckCircle } from "lucide-react";

const SafetyTips = () => {
  const tips = [
    {
      icon: Eye,
      title: "Always Visit in Person",
      description: "Never pay for a hostel without visiting it first. Inspect the room, facilities, and surrounding area during daylight hours.",
      color: "text-blue-600"
    },
    {
      icon: FileCheck,
      title: "Verify Documentation",
      description: "Request to see the owner's property documents and valid ID. Ensure they have legal rights to rent out the property.",
      color: "text-green-600"
    },
    {
      icon: Users,
      title: "Bring Someone Along",
      description: "When viewing a hostel, bring a friend or family member. There's safety in numbers, especially when meeting strangers.",
      color: "text-purple-600"
    },
    {
      icon: AlertTriangle,
      title: "Watch for Red Flags",
      description: "Be cautious of deals that seem too good to be true, pressure to pay immediately, or owners who avoid in-person meetings.",
      color: "text-orange-600"
    },
    {
      icon: CheckCircle,
      title: "Get Everything in Writing",
      description: "Ensure you have a written agreement that includes rent amount, payment schedule, house rules, and refund policy.",
      color: "text-teal-600"
    },
    {
      icon: Shield,
      title: "Secure Payment Methods",
      description: "Use traceable payment methods and always get a receipt. Avoid paying large sums in cash without proper documentation.",
      color: "text-red-600"
    }
  ];

  const additionalTips = [
    "Check the security features of the hostel including locks, gates, and lighting",
    "Ask current or former tenants about their experience living there",
    "Verify the hostel's proximity to your university and transportation options",
    "Inspect water supply, electricity, and internet connectivity",
    "Understand the hostel rules regarding visitors, noise, and curfews",
    "Keep copies of all payment receipts and agreements",
    "Report suspicious listings or scam attempts to HostelNG immediately",
    "Trust your instincts - if something feels wrong, walk away",
    "Research the neighborhood's safety reputation and crime rates",
    "Ensure emergency exits are accessible and fire safety measures are in place"
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Safety Tips for Students
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Your safety is our priority. Follow these guidelines to ensure a secure hostel hunting experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {tips.map((tip, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-all hover:-translate-y-1"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${tip.color}/10 mb-4`}>
                  <tip.icon className={`w-6 h-6 ${tip.color}`} />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  {tip.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {tip.description}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-card border border-border rounded-xl p-8 mb-12">
            <h2 className="font-display text-2xl font-bold text-foreground mb-6">
              Additional Safety Checklist
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {additionalTips.map((tip, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <p className="text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-xl p-8">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-8 h-8 text-red-600 shrink-0" />
              <div>
                <h3 className="font-display text-xl font-bold text-red-900 dark:text-red-100 mb-3">
                  Report Suspicious Activity
                </h3>
                <p className="text-red-800 dark:text-red-200 mb-4">
                  If you encounter a suspicious listing, experience a scam attempt, or feel unsafe during a hostel viewing, report it immediately using our report feature or contact us directly.
                </p>
                <a
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=Clonexoxo80@gmail.com&su=Safety%20Report"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
                >
                  Report an Issue
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SafetyTips;
