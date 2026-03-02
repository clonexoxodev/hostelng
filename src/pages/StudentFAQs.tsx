import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { HelpCircle } from "lucide-react";

const StudentFAQs = () => {
  const faqs = [
    {
      question: "How do I find a hostel on HostelNG?",
      answer: "Simply browse our listings, use filters to narrow down your search by location, university, and price range. You can view detailed information, photos, and amenities for each hostel."
    },
    {
      question: "Is payment handled through HostelNG?",
      answer: "No, we don't process payments. Students contact hostel owners directly to arrange viewing, verification, and payment. This gives you more control and flexibility in your hostel selection process."
    },
    {
      question: "How do I know if a hostel listing is genuine?",
      answer: "We encourage students to visit hostels in person before making any payment. Use our report feature if you encounter suspicious listings. Always verify the property exists and matches the description before paying."
    },
    {
      question: "What's the difference between Semester and Session listings?",
      answer: "Semester listings are for one academic semester (typically 4-6 months), while Session listings cover the full academic year (typically 9-12 months). Prices and availability vary accordingly."
    },
    {
      question: "Can I report a suspicious or fake listing?",
      answer: "Yes! Every hostel detail page has a 'Report Listing' button. Select the reason for your report and provide details. Our admin team reviews all reports promptly and takes appropriate action."
    },
    {
      question: "How do I contact a hostel owner?",
      answer: "On each hostel detail page, you'll find 'Call Owner' and 'Email Owner' buttons with the owner's contact information. Reach out directly to schedule viewings or ask questions."
    },
    {
      question: "Are the hostels verified by HostelNG?",
      answer: "We require hostel owners to provide accurate information and photos. However, we strongly recommend visiting any hostel in person before making payment decisions."
    },
    {
      question: "What should I do before paying for a hostel?",
      answer: "Always visit the hostel in person, verify it matches the listing, check the condition of facilities, meet the owner or agent, read any agreement carefully, and never pay the full amount without proper documentation."
    },
    {
      question: "Can I get a refund if I'm not satisfied?",
      answer: "Refund policies are determined by individual hostel owners, not HostelNG. Discuss refund terms with the owner before making any payment and ensure it's documented in your agreement."
    },
    {
      question: "How often are new hostels added?",
      answer: "New hostels are added regularly as owners list their properties. Check back frequently or enable notifications to stay updated on new listings in your preferred area."
    }
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <HelpCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Student FAQs
            </h1>
            <p className="text-muted-foreground text-lg">
              Find answers to common questions about using HostelNG
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow"
              >
                <h3 className="font-display text-lg font-semibold text-foreground mb-3">
                  {faq.question}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 bg-primary/5 border border-primary/20 rounded-xl p-8 text-center">
            <h3 className="font-display text-xl font-bold text-foreground mb-3">
              Still have questions?
            </h3>
            <p className="text-muted-foreground mb-6">
              Can't find the answer you're looking for? Our support team is here to help.
            </p>
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=Clonexoxo80@gmail.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-medium hover:shadow-lg transition-shadow"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default StudentFAQs;
