// src/lib/nepal-districts.js
// All 77 official districts of Nepal organised by province

export const NEPAL_DISTRICTS_BY_PROVINCE = [
  {
    province: 'Koshi Province (Province 1)',
    districts: [
      'Bhojpur','Dhankuta','Ilam','Jhapa','Khotang',
      'Morang','Okhaldhunga','Panchthar','Sankhuwasabha',
      'Solukhumbu','Sunsari','Taplejung','Terhathum','Udayapur',
    ],
  },
  {
    province: 'Madhesh Province (Province 2)',
    districts: [
      'Bara','Dhanusha','Mahottari','Parsa',
      'Rautahat','Saptari','Sarlahi','Siraha',
    ],
  },
  {
    province: 'Bagmati Province (Province 3)',
    districts: [
      'Bhaktapur','Chitwan','Dhading','Dolakha','Kathmandu',
      'Kavrepalanchok','Lalitpur','Makwanpur','Nuwakot',
      'Ramechhap','Rasuwa','Sindhuli','Sindhupalchok',
    ],
  },
  {
    province: 'Gandaki Province (Province 4)',
    districts: [
      'Baglung','Gorkha','Kaski','Lamjung','Manang',
      'Mustang','Myagdi','Nawalpur','Parbat','Syangja','Tanahun',
    ],
  },
  {
    province: 'Lumbini Province (Province 5)',
    districts: [
      'Arghakhanchi','Banke','Bardiya','Dang','Gulmi',
      'Kapilvastu','Nawalparasi','Palpa','Pyuthan',
      'Rolpa','Rukum East','Rupandehi',
    ],
  },
  {
    province: 'Karnali Province (Province 6)',
    districts: [
      'Dailekh','Dolpa','Humla','Jajarkot','Jumla',
      'Kalikot','Mugu','Salyan','Surkhet','Rukum West',
    ],
  },
  {
    province: 'Sudurpashchim Province (Province 7)',
    districts: [
      'Achham','Baitadi','Bajhang','Bajura','Dadeldhura',
      'Darchula','Doti','Kailali','Kanchanpur',
    ],
  },
];

// Flat list of all 77 districts
export const NEPAL_DISTRICTS = NEPAL_DISTRICTS_BY_PROVINCE
  .flatMap(p => p.districts)
  .sort();

// Fast lookup set for validation
export const DISTRICT_SET = new Set(NEPAL_DISTRICTS.map(d => d.toLowerCase()));

// Validate a district input
export function isValidDistrict(input) {
  return DISTRICT_SET.has(input?.trim().toLowerCase());
}

// Find closest match (for suggestions)
export function searchDistricts(query) {
  if (!query?.trim()) return [];
  const q = query.trim().toLowerCase();
  return NEPAL_DISTRICTS.filter(d => d.toLowerCase().startsWith(q))
    .concat(NEPAL_DISTRICTS.filter(d => d.toLowerCase().includes(q) && !d.toLowerCase().startsWith(q)))
    .slice(0, 8);
}
