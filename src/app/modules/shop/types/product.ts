type Product = {
  product_id: number;
  name: string;
  brand: string;
  specification: string;
  country: string;
  short_description: string;
  manufacturer: string;
  registration_number: string;
  description_html: string;
  slug: string;
  image_url: string;
  discount_percentage: number;
  category: {
    category_id: number;
    name: string;
    slug: string;
    image: string | null;
  };
  variants: [
    {
      unit: string;
      price: number;
    },
  ];
  ingredients?: [
    {
      ingredient_id: number;
      name: string;
      concentration: string;
    },
  ];
  usages?: [
    {
      usage_id: number;
      description: string;
    },
  ];
  dosages?: [
    {
      dosage_id: number;
      description: string;
    },
  ];
  precautions?: [
    {
      precaution_id: number;
      description: string;
    },
  ];
  sideEffects?: [
    {
      side_effect_id: number;
      description: string;
    },
  ];
  storages?: [
    {
      storage_id: number;
      description: string;
    },
  ];
};

export type { Product };
