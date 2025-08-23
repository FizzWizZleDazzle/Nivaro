export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface PricingTier {
  name: string;
  price: number;
  description: string;
  features: string[];
  highlighted?: boolean;
  buttonText?: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  club: string;
  content: string;
  avatar?: string;
  rating: number;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  avatar?: string;
  linkedin?: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  club?: string;
  message: string;
}