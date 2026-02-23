import hostel1 from "@/assets/hostel-1.jpg";
import hostel2 from "@/assets/hostel-2.jpg";
import hostel3 from "@/assets/hostel-3.jpg";
import hostel4 from "@/assets/hostel-4.jpg";

export type RoomType = "single" | "double" | "self-contain" | "flat";

export interface Room {
  type: RoomType;
  price: number;
  available: number;
  total: number;
}

export interface Hostel {
  id: string;
  name: string;
  university: string;
  location: string;
  city: string;
  state: string;
  distance: string;
  rating: number;
  reviewCount: number;
  images: string[];
  rooms: Room[];
  amenities: string[];
  description: string;
  owner: string;
  verified: boolean;
  featured: boolean;
  gender: "male" | "female" | "mixed";
  minPrice: number;
}

export const hostels: Hostel[] = [
  {
    id: "1",
    name: "Greenview Student Lodge",
    university: "University of Ibadan (UI)",
    location: "Bodija, Ibadan",
    city: "Ibadan",
    state: "Oyo",
    distance: "5 mins walk to UI gate",
    rating: 4.8,
    reviewCount: 124,
    images: [hostel1, hostel2],
    rooms: [
      { type: "single", price: 280000, available: 4, total: 10 },
      { type: "double", price: 180000, available: 8, total: 20 },
      { type: "self-contain", price: 450000, available: 2, total: 6 },
    ],
    amenities: ["24/7 Security", "Borehole Water", "Solar Power", "Wi-Fi", "CCTV", "Parking", "Study Room", "Laundry"],
    description:
      "A modern, secure student accommodation located just 5 minutes walk from the University of Ibadan main gate. Enjoy a peaceful environment with reliable power supply and top-notch security.",
    owner: "Chief Emeka Obi",
    verified: true,
    featured: true,
    gender: "mixed",
    minPrice: 180000,
  },
  {
    id: "2",
    name: "Royal Palm Hostel",
    university: "Polytechnic Ibadan (IBADANPOLY)",
    location: "Lagelu, Ibadan",
    city: "Ibadan",
    state: "Oyo",
    distance: "8 mins walk to Polytechnic Ibadan gate",
    rating: 4.6,
    reviewCount: 89,
    images: [hostel3, hostel4],
    rooms: [
      { type: "double", price: 150000, available: 12, total: 30 },
      { type: "self-contain", price: 320000, available: 3, total: 8 },
    ],
    amenities: ["24/7 Security", "Swimming Pool", "Solar Power", "Wi-Fi", "CCTV", "Parking", "Kitchen"],
    description:
      "Premium student hostel with a swimming pool and lush gardens. Experience luxury student living at affordable prices, close to the Polytechnic Ibadan campus with excellent security and facilities.",
    owner: "Mrs. Funmilayo Adeyemi",
    verified: true,
    featured: true,
    gender: "female",
    minPrice: 150000,
  },
  {
    id: "3",
    name: "Scholars' Inn",
    university: "Ekiti State University (EKSU)",
    location: "Ado-Ekiti",
    city: "Ado-Ekiti",
    state: "Ekiti",
    distance: "10 mins walk to EKSU gate",
    rating: 4.5,
    reviewCount: 67,
    images: [hostel2, hostel1],
    rooms: [
      { type: "single", price: 200000, available: 6, total: 15 },
      { type: "double", price: 130000, available: 10, total: 25 },
    ],
    amenities: ["24/7 Security", "Borehole Water", "Generator", "CCTV", "Study Room", "Kitchen", "Laundry"],
    description:
      "Purpose-built student accommodation near Ekiti State University, offering a calm study environment with reliable utilities and strong security measures.",
    owner: "Mr. Chukwudi Nwosu",
    verified: true,
    featured: false,
    gender: "male",
    minPrice: 130000,
  },
  {
    id: "4",
    name: "Harmony Heights",
    university: "Federal Polytechnic Ado-Ekiti (FEDPOLYADOEKITI)",
    location: "Ado-Ekiti",
    city: "Ado-Ekiti",
    state: "Ekiti",
    distance: "15 mins drive to Federal Polytechnic",
    rating: 4.3,
    reviewCount: 45,
    images: [hostel4, hostel3],
    rooms: [
      { type: "double", price: 120000, available: 15, total: 40 },
      { type: "self-contain", price: 280000, available: 5, total: 12 },
      { type: "flat", price: 480000, available: 2, total: 5 },
    ],
    amenities: ["Security", "Borehole Water", "Solar Power", "Parking", "CCTV", "Gym"],
    description:
      "Spacious and affordable accommodation for Federal Polytechnic Ado-Ekiti students. Features modern rooms and a gym facility for an active student lifestyle.",
    owner: "Alhaji Musa Ibrahim",
    verified: true,
    featured: false,
    gender: "mixed",
    minPrice: 120000,
  },
  {
    id: "5",
    name: "Academic Haven",
    university: "Ajayi Crowther University (ACU)",
    location: "Oyo Town, Ibadan",
    city: "Ibadan",
    state: "Oyo",
    distance: "3 mins walk to ACU",
    rating: 4.9,
    reviewCount: 203,
    images: [hostel3, hostel2],
    rooms: [
      { type: "single", price: 250000, available: 3, total: 12 },
      { type: "self-contain", price: 520000, available: 2, total: 8 },
    ],
    amenities: ["24/7 Security", "Swimming Pool", "Solar Power", "Wi-Fi", "CCTV", "Gym", "Backup Generator", "Smart TV"],
    description:
      "Premium accommodation for Ajayi Crowther University students. World-class facilities including a gym, pool, and smart rooms designed for the modern student.",
    owner: "Ibadan Property Ventures Ltd.",
    verified: true,
    featured: true,
    gender: "mixed",
    minPrice: 250000,
  },
  {
    id: "6",
    name: "UniView Hostel",
    university: "Afe Babalola University (ABUAD)",
    location: "Ado-Ekiti",
    city: "Ado-Ekiti",
    state: "Ekiti",
    distance: "12 mins walk to ABUAD gate",
    rating: 4.4,
    reviewCount: 78,
    images: [hostel1, hostel4],
    rooms: [
      { type: "double", price: 160000, available: 9, total: 22 },
      { type: "self-contain", price: 340000, available: 4, total: 10 },
    ],
    amenities: ["24/7 Security", "Borehole Water", "Generator", "Wi-Fi", "CCTV", "Study Room", "Laundry"],
    description:
      "Comfortable and well-maintained student accommodation near Afe Babalola University. Clean rooms, reliable water supply, and strong Wi-Fi for academic success.",
    owner: "Dr. Afolabi Ogunleye",
    verified: true,
    featured: false,
    gender: "female",
    minPrice: 160000,
  },
];

export const universities = [
  "University of Ibadan (UI)",
  "Polytechnic Ibadan (IBADANPOLY)",
  "Ajayi Crowther University (ACU)",
  "Ekiti State University (EKSU)",
  "Federal Polytechnic Ado-Ekiti (FEDPOLYADOEKITI)",
  "Afe Babalola University (ABUAD)",
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(price);
};

export const roomTypeLabel: Record<RoomType, string> = {
  single: "Single Room",
  double: "Double Room",
  "self-contain": "Self-Contain",
  flat: "Flat",
};
