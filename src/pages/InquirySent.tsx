import { useLocation, useParams, Link } from 'react-router-dom';
import { CheckCircle, Phone, Mail, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

// Sanitize phone for wa.me — strips non-digits, converts 0XXXXXXXXXX → 234XXXXXXXXXX
const toWhatsAppNumber = (phone: string): string => {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('0')) return '234' + digits.slice(1);
  if (digits.startsWith('234')) return digits;
  return digits;
};

const buildWhatsAppUrl = (phone: string, message: string) =>
  `https://wa.me/${toWhatsAppNumber(phone)}?text=${encodeURIComponent(message)}`;

const InquirySent = () => {
  const { id } = useParams();
  const location = useLocation();
  const state = location.state as {
    hostelName?: string;
    studentName?: string;
    agentPhone?: string;
    agentEmail?: string;
    agentName?: string;
    agencyName?: string;
    agentWhatsapp?: string;
  } | null;

  const agentPhone = state?.agentPhone || '';
  const agentWhatsapp = state?.agentWhatsapp || agentPhone;
  const whatsappUrl = agentWhatsapp
    ? buildWhatsAppUrl(agentWhatsapp, `Hi, I'm interested in ${state?.hostelName || 'your property'} listed on HostelNG.`)
    : null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-xl">
          {/* Success Banner */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-950/30 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
              Inquiry Sent!
            </h1>
            <p className="text-muted-foreground">
              Your request has been sent to the property owner for{' '}
              <span className="font-medium text-foreground">{state?.hostelName || 'this property'}</span>.
              You can also contact them directly below.
            </p>
          </div>

          {/* Owner Contact Card */}
          <div className="bg-card rounded-2xl border border-border p-6 mb-6">
            <h2 className="font-display font-bold text-lg text-foreground mb-4">Owner Contact Details</h2>

            <div className="space-y-3 mb-6">
              {state?.agentName && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <span className="text-primary font-bold text-xs">
                      {state.agentName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Owner Name</p>
                    <p className="font-medium text-foreground">{state.agentName}</p>
                  </div>
                </div>
              )}

              {state?.agencyName && (
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <span className="text-muted-foreground text-xs font-bold">AG</span>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Agency</p>
                    <p className="font-medium text-foreground">{state.agencyName}</p>
                  </div>
                </div>
              )}

              {agentPhone && (
                <a
                  href={`tel:${agentPhone}`}
                  className="flex items-center gap-3 text-sm p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="font-medium text-foreground">{agentPhone}</p>
                  </div>
                </a>
              )}

              {state?.agentEmail && (
                <a
                  href={`mailto:${state.agentEmail}`}
                  className="flex items-center gap-3 text-sm p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
                >
                  <Mail className="w-4 h-4 text-primary shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="font-medium text-foreground">{state.agentEmail}</p>
                  </div>
                </a>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {agentPhone && (
                <a href={`tel:${agentPhone}`} className="w-full">
                  <Button className="w-full gradient-primary border-0 shadow-primary text-primary-foreground font-semibold" size="lg">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Agent
                  </Button>
                </a>
              )}
              {whatsappUrl && (
                <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button
                    className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white border-0 font-semibold"
                    size="lg"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Chat on WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </div>

          {/* Back Links */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" asChild className="flex-1">
              <Link to={`/hostels/${id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Property
              </Link>
            </Button>
            <Button variant="outline" asChild className="flex-1">
              <Link to="/hostels">Browse More Hostels</Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default InquirySent;
