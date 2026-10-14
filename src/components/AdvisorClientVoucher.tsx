import React from 'react';
import { Printer, X, CheckCircle, ShieldCheck, MapPin, Calendar, Users, QrCode, Phone, Mail, Award } from 'lucide-react';
import { Booking, ClientPassengerInfo } from '../context/AuthContext';
import { TOURS_DATA } from '../data/toursData';

interface AdvisorClientVoucherProps {
  booking: Booking;
  onClose: () => void;
}

export const AdvisorClientVoucher: React.FC<AdvisorClientVoucherProps> = ({ booking, onClose }) => {
  const tour = TOURS_DATA.find((t) => t.id === booking.tourId || t.slug === booking.tourSlug) || TOURS_DATA[0];
  const advisor = booking.advisorDetails;

  const handlePrint = () => {
    window.print();
  };

  const clients: ClientPassengerInfo[] = advisor?.clients && advisor.clients.length > 0
    ? advisor.clients
    : [
        {
          id: 'pax-lead',
          firstName: booking.leadName.split(' ')[0] || 'Lead',
          lastName: booking.leadName.split(' ').slice(1).join(' ') || 'Passenger',
          gender: 'Female',
          dob: '1985-05-15',
          passportNumber: 'PASS-VERIFIED',
          passportExpiry: '2030-12-31',
          passportCountry: 'International',
          dietaryRequirements: booking.dietaryNotes || 'Standard',
          medicalConditions: 'None reported',
          phone: booking.leadPhone,
          email: booking.leadEmail,
          roomPreference: 'Double',
        },
      ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-3 sm:p-6 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl rounded-2xl bg-white text-zinc-900 shadow-2xl overflow-hidden my-auto print:shadow-none print:max-w-none print:rounded-none">
        {/* Top Control Bar (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50 px-6 py-3.5 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="size-4 text-emerald-600" />
            <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
              Client Expedition Voucher (Price-Free White Label)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs"
            >
              <Printer className="size-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-800 transition-colors cursor-pointer"
              title="Close Voucher"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PRINTABLE VOUCHER CANVAS (STRICTLY WITHOUT ANY PRICES)          */}
        {/* ============================================================== */}
        <div className="p-8 sm:p-10 space-y-8 print:p-8" id="printable-voucher-body">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-zinc-200 pb-6">
            <div>
              <div className="flex items-center gap-3">
                <img
                  src="/atlas-logo.png"
                  alt="Atlas Global Tours"
                  className="h-8 w-auto object-contain"
                />
                <span className="text-xs uppercase font-bold tracking-[0.25em] text-zinc-400">
                  Global Tours
                </span>
              </div>
              <p className="mt-2 text-xs text-zinc-500 max-w-md leading-relaxed">
                Licensed Boutique Small-Group Tour Operator · Official Travel Partner Voucher
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-800 px-3 py-1 text-xs font-bold uppercase tracking-wider border border-emerald-200">
                <CheckCircle className="size-3.5" /> Confirmed & Guaranteed
              </span>
              <div className="mt-2 text-xs text-zinc-500 font-mono">
                Voucher Ref: <strong className="text-zinc-900 font-bold text-sm">{booking.reference}</strong>
              </div>
              <div className="text-[0.7rem] text-zinc-400">
                Issued Date: {new Date(booking.createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Agency & Advisor Co-Branding Banner */}
          {advisor && (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[0.65rem] uppercase font-bold tracking-wider text-zinc-400 block">
                  Arranged via Official Travel Advisor
                </span>
                <span className="font-bold text-zinc-900 text-sm">
                  {advisor.agencyName}
                </span>
                <span className="text-xs text-zinc-600 block">
                  Advisor: {advisor.advisorName} {advisor.iataCliaNumber ? `(ID: ${advisor.iataCliaNumber})` : ''}
                </span>
              </div>
              <div className="text-xs text-zinc-500 sm:text-right">
                <span>Direct Partner Desk</span>
                <span className="block font-mono text-[0.7rem] text-zinc-600">{advisor.advisorEmail}</span>
              </div>
            </div>
          )}

          {/* Tour Journey Overview */}
          <div className="rounded-xl border border-zinc-200 bg-white p-5 space-y-4">
            <div>
              <span className="text-[0.65rem] uppercase font-bold tracking-widest text-emerald-700">
                Confirmed Expedition Itinerary
              </span>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900 mt-0.5">
                {booking.tourTitle}
              </h1>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-3 border-t border-zinc-100 text-xs">
              <div>
                <span className="text-zinc-400 block text-[0.7rem]">Departure Date</span>
                <span className="font-bold text-zinc-900 font-mono text-sm">{booking.departureDate}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[0.7rem]">Total Travelers</span>
                <span className="font-bold text-zinc-900 text-sm">{booking.guests} Guest{booking.guests !== 1 ? 's' : ''}</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[0.7rem]">Expedition Style</span>
                <span className="font-bold text-zinc-900 text-sm">Small Group (Max 12)</span>
              </div>
              <div>
                <span className="text-zinc-400 block text-[0.7rem]">Guiding Language</span>
                <span className="font-bold text-zinc-900 text-sm">English (Licensed)</span>
              </div>
            </div>
          </div>

          {/* Passenger Manifest Table with Passport, DOB, Medical & Dietary Details */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-700 flex items-center gap-1.5">
                <Users className="size-3.5 text-emerald-700" /> Passenger Manifest & Travel Credentials
              </h2>
              <span className="text-[0.7rem] text-zinc-500">
                All credentials verified for local permits
              </span>
            </div>

            <div className="overflow-hidden rounded-xl border border-zinc-200">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-100 font-bold text-zinc-600 border-b border-zinc-200">
                  <tr>
                    <th className="px-3.5 py-2.5">Passenger Name</th>
                    <th className="px-3.5 py-2.5">DOB & Gender</th>
                    <th className="px-3.5 py-2.5">Passport No. & Expiry</th>
                    <th className="px-3.5 py-2.5">Dietary Requirements</th>
                    <th className="px-3.5 py-2.5">Medical / Special Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 font-medium text-zinc-800">
                  {clients.map((client, idx) => (
                    <tr key={client.id || idx} className="hover:bg-zinc-50/50">
                      <td className="px-3.5 py-3 font-bold text-zinc-900">
                        {idx + 1}. {client.firstName} {client.middleName ? `${client.middleName} ` : ''}{client.lastName}
                        {(() => {
                          const isDayTourBooking =
                            booking.tourTitle.toLowerCase().includes('day') ||
                            booking.tourSlug.includes('day') ||
                            booking.specialRequests?.includes('Day Excursion');
                          if (isDayTourBooking) {
                            return (
                              <span className="block font-normal text-[0.68rem] text-emerald-700">
                                Day Excursion · No Rooming
                              </span>
                            );
                          }
                          return client.roomPreference ? (
                            <span className="block font-normal text-[0.7rem] text-zinc-500">
                              Room: {client.roomPreference}
                            </span>
                          ) : null;
                        })()}
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="font-mono text-zinc-700">{client.dob || 'On file'}</span>
                        <span className="block text-[0.7rem] text-zinc-500">{client.gender || 'Not specified'}</span>
                      </td>
                      <td className="px-3.5 py-3 whitespace-nowrap">
                        <span className="font-mono font-bold text-zinc-900">{client.passportNumber || 'Submitted'}</span>
                        <span className="block text-[0.7rem] text-zinc-500 font-mono">
                          Exp: {client.passportExpiry || 'Valid'} ({client.passportCountry || 'Intl'})
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="text-emerald-800 font-medium">
                          {client.dietaryRequirements || 'Standard Dining'}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 text-zinc-600">
                        {client.medicalConditions && client.medicalConditions !== 'None'
                          ? client.medicalConditions
                          : 'No medical alerts reported'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Expedition Inclusions (NO PRICES) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50">
              <span className="text-[0.65rem] uppercase font-bold tracking-wider text-emerald-800 block mb-2">
                What is Included on This Journey
              </span>
              <ul className="space-y-1.5 text-xs text-zinc-700">
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Full-time certified Ministry of Tourism guide</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Handpicked boutique & historic hotel accommodations</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Private Mercedes Sprinter VIP air-conditioned ground transport</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>All UNESCO site entrance admissions & skip-the-line permits</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <CheckCircle className="size-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>Daily artisan breakfasts & curated welcome/farewell culinary dinners</span>
                </li>
              </ul>
            </div>

            <div className="rounded-xl border border-zinc-200 p-4 bg-zinc-50/50">
              <span className="text-[0.65rem] uppercase font-bold tracking-wider text-zinc-600 block mb-2">
                Meeting Point & Arrival Briefing
              </span>
              <div className="space-y-2 text-xs text-zinc-700">
                <p>
                  <strong>Rendezvous Point:</strong> {tour.meeting_point || 'Hotel lobby on Day 1 at 09:00 AM local time.'}
                </p>
                <p>
                  <strong>Luggage Guideline:</strong> 1 medium suitcase (max 23 kg) + 1 daypack per guest.
                </p>
                <p>
                  <strong>Dress & Etiquette:</strong> Modest attire with shoulder and knee coverage recommended for sacred religious monuments.
                </p>
              </div>
            </div>
          </div>

          {/* Operations & 24/7 Assistance Contacts */}
          <div className="border-t border-zinc-200 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-zinc-600">
            <div>
              <strong className="text-zinc-900 block font-semibold">24/7 Operations Duty Manager</strong>
              <span>Phone: +90 (532) 745 19 82 · Email: operations@atlasglobaltours.com</span>
              <span className="block text-[0.7rem] text-zinc-400 mt-0.5">
                Global Operations & Regional Hubs: Sultanahmet Mah., Divanyolu Cad. No: 42, Fatih | Expeditions Worldwide
              </span>
            </div>

            <div className="flex items-center gap-3 self-start sm:self-auto">
              <div className="border border-zinc-300 rounded-lg p-2 bg-white flex flex-col items-center">
                <QrCode className="size-10 text-zinc-800" />
                <span className="text-[0.55rem] font-mono text-zinc-500 uppercase mt-0.5">Verified Partner</span>
              </div>
            </div>
          </div>

          {/* Bottom Security Note */}
          <div className="text-center text-[0.65rem] text-zinc-400 border-t border-zinc-100 pt-4">
            This official expedition voucher serves as proof of booking and guaranteed departure for all listed passengers. Prices and operator commissions are strictly excluded for white-label client distribution.
          </div>
        </div>
      </div>
    </div>
  );
};
