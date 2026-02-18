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
    university: "University of Lagos (UNILAG)",
    location: "Abule-Oja, Yaba",
    city: "Lagos",
    state: "Lagos",
    distance: "5 mins walk to UNILAG gate",
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
      "A modern, secure student accommodation located just 5 minutes walk from the University of Lagos main gate. Enjoy a peaceful environment with reliable power supply and top-notch security.",
    owner: "Chief Emeka Obi",
    verified: true,
    featured: true,
    gender: "mixed",
    minPrice: 180000,
  },
  {
    id: "2",
    name: "Royal Palm Hostel",
    university: "Obafemi Awolowo University (OAU)",
    location: "Old Garage, Ile-Ife",
    city: "Ile-Ife",
    state: "Osun",
    distance: "8 mins walk to OAU gate",
    rating: 4.6,
    reviewCount: 89,
    images: [hostel3, hostel4],
    rooms: [
      { type: "double", price: 150000, available: 12, total: 30 },
      { type: "self-contain", price: 320000, available: 3, total: 8 },
    ],
    amenities: ["24/7 Security", "Swimming Pool", "Solar Power", "Wi-Fi", "CCTV", "Parking", "Kitchen"],
    description:
      "Premium student hostel with a swimming pool and lush gardens. Experience luxury student living at affordable prices, close to the OAU campus with excellent security and facilities.",
    owner: "Mrs. Funmilayo Adeyemi",
    verified: true,
    featured: true,
    gender: "female",
    minPrice: 150000,
  },
  {
    id: "3",
    name: "Scholars' Inn",
    university: "University of Nigeria (UNN)",
    location: "Agbani Road, Enugu",
    city: "Nsukka",
    state: "Enugu",
    distance: "10 mins walk to UNN gate",
    rating: 4.5,
    reviewCount: 67,
    images: [hostel2, hostel1],
    rooms: [
      { type: "single", price: 200000, available: 6, total: 15 },
      { type: "double", price: 130000, available: 10, total: 25 },
    ],
    amenities: ["24/7 Security", "Borehole Water", "Generator", "CCTV", "Study Room", "Kitchen", "Laundry"],
    description:
      "Purpose-built student accommodation near the University of Nigeria, offering a calm study environment with reliable utilities and strong security measures.",
    owner: "Mr. Chukwudi Nwosu",
    verified: true,
    featured: false,
    gender: "male",
    minPrice: 130000,
  },
  {
    id: "4",
    name: "Harmony Heights",
    university: "Ahmadu Bello University (ABU)",
    location: "Sabon Gari, Zaria",
    city: "Zaria",
    state: "Kaduna",
    distance: "15 mins drive to ABU",
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
      "Spacious and affordable accommodation for Ahmadu Bello University students. Features modern rooms and a gym facility for an active student lifestyle.",
    owner: "Alhaji Musa Ibrahim",
    verified: true,
    featured: false,
    gender: "mixed",
    minPrice: 120000,
  },
  {
    id: "5",
    name: "Lekki Student Suites",
    university: "Pan-Atlantic University",
    location: "Km 52, Lekki",
    city: "Lagos",
    state: "Lagos",
    distance: "3 mins walk to PAU",
    rating: 4.9,
    reviewCount: 203,
    images: [hostel3, hostel2],
    rooms: [
      { type: "single", price: 600000, available: 3, total: 12 },
      { type: "self-contain", price: 900000, available: 2, total: 8 },
    ],
    amenities: ["24/7 Security", "Swimming Pool", "Solar Power", "Wi-Fi", "CCTV", "Gym", "Backup Generator", "Smart TV"],
    description:
      "Ultra-premium accommodation for Pan-Atlantic University students. World-class facilities including a gym, pool, and smart rooms designed for the modern student.",
    owner: "Lagos Property Ventures Ltd.",
    verified: true,
    featured: true,
    gender: "mixed",
    minPrice: 600000,
  },
  {
    id: "6",
    name: "UniView Hostel",
    university: "University of Ibadan (UI)",
    location: "Bodija, Ibadan",
    city: "Ibadan",
    state: "Oyo",
    distance: "12 mins walk to UI gate",
    rating: 4.4,
    reviewCount: 78,
    images: [hostel1, hostel4],
    rooms: [
      { type: "double", price: 160000, available: 9, total: 22 },
      { type: "self-contain", price: 340000, available: 4, total: 10 },
    ],
    amenities: ["24/7 Security", "Borehole Water", "Generator", "Wi-Fi", "CCTV", "Study Room", "Laundry"],
    description:
      "Comfortable and well-maintained student accommodation near the University of Ibadan. Clean rooms, reliable water supply, and strong Wi-Fi for academic success.",
    owner: "Dr. Afolabi Ogunleye",
    verified: true,
    featured: false,
    gender: "female",
    minPrice: 160000,
  },
];

export const universities = [
  "University of Lagos (UNILAG)",
  "Obafemi Awolowo University (OAU)",
  "University of Nigeria (UNN)",
  "Ahmadu Bello University (ABU)",
  "University of Ibadan (UI)",
  "Pan-Atlantic University",
  "Covenant University",
  "University of Benin (UNIBEN)",
  "Federal University of Technology Akure (FUTA)",
  "Babcock University",
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
