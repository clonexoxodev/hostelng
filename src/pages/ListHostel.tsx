import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2, Building2, Camera, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from '@/lib/supabase';

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
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      
      // Redirect authenticated agents to dashboard
      if (session?.user?.user_metadata?.role === 'agent') {
        navigate('/dashboard');
      }
      
      setLoading(false);
    });
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      
      // Redirect authenticated agents to dashboard
      if (session?.user?.user_metadata?.role === 'agent') {
        navigate('/dashboard');
      }
    });
    
    return () => subscription.unsubscribe();
  }, [navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-br from-primary/5 to-accent/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary text-xs font-semibold px-4 py-2 rounded-full mb-6">
              <Building2 className="w-3.5 h-3.5" />
              For Hostel Owners
            </div>
            <h1 className="font-display font-bold text-4xl md:text-5xl text-foreground mb-6">
              List Your Hostel on HostelNG
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-8">
              Reach thousands of university students actively searching for quality accommodation. List your property for free and only pay when you get bookings.
            </p>
            <Button className="gradient-primary border-0 shadow-primary text-primary-foreground px-8 font-semibold" size="lg" asChild>
              <Link to="/signin">
                Get Started — It's Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <p className="section-label mb-2">Simple Process</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
              How to List Your Hostel
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative bg-card rounded-2xl border border-border p-6 hover:shadow-card-hover transition-shadow">
                  <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                    {i + 1}
                  </div>
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">{step.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <p className="section-label mb-2">Why List With Us</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground">
                Benefits for Hostel Owners
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {perks.map((perk, i) => (
                <div key={i} className="flex items-start gap-3 bg-background rounded-xl border border-border p-4">
                  <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground text-sm leading-relaxed">{perk}</span>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Button className="gradient-primary border-0 shadow-primary text-primary-foreground px-8 font-semibold" size="lg" asChild>
                <Link to="/signin">
                  Start Listing Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Registration Section - Only show for non-agents */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-center justify-center min-h-[400px]">
              <Building2 className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="font-display font-bold text-xl text-foreground mb-2">Ready to List Your Hostel?</h3>
              <p className="text-muted-foreground text-sm mb-6 text-center">
                Sign in as a hostel listing agent to access the dashboard and start adding your properties.
              </p>
              <div className="flex gap-4">
                <Button variant="outline" asChild>
                  <Link to="/register">Register as Agent</Link>
                </Button>
                <Button className="gradient-primary border-0 shadow-primary text-primary-foreground" asChild>
                  <Link to="/signin">Sign In</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ListHostel;
