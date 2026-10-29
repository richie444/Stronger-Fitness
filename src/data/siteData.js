export const classCategories = ["All classes", "Strength", "Cardio", "HIIT", "Mobility"];

export const classes = [
  { id: 1, name: "Strength Lab", category: "Strength", day: "Monday", time: "6:00 AM", coach: "Leah Martin", duration: "50 min", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=900&q=85", alt: "Warm, sunlit strength training studio" },
  { id: 2, name: "Spin", category: "Cardio", day: "Monday", time: "12:15 PM", coach: "Tom Jackson", duration: "45 min", image: "https://images.unsplash.com/photo-1517963879433-6ad2b056d712?auto=format&fit=crop&w=900&q=85", alt: "Athlete training hard in a gym" },
  { id: 3, name: "HIIT Circuit", category: "HIIT", day: "Tuesday", time: "6:30 AM", coach: "Tom Jackson", duration: "45 min", image: "https://images.unsplash.com/photo-1546483875-ad9014c88eba?auto=format&fit=crop&w=900&q=85", alt: "High-energy functional workout" },
  { id: 4, name: "Mobility", category: "Mobility", day: "Tuesday", time: "1:00 PM", coach: "Sonia Khan", duration: "40 min", image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=85", alt: "Athlete stretching on a mat" },
  { id: 5, name: "Cycle Sprint", category: "Cardio", day: "Wednesday", time: "7:00 AM", coach: "Tom Jackson", duration: "45 min", image: "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=85", alt: "Group cardio training session" },
  { id: 6, name: "Bootcamp", category: "HIIT", day: "Wednesday", time: "12:00 PM", coach: "Daniel Ross", duration: "50 min", image: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=85", alt: "Athlete doing a focused strength workout" },
  { id: 7, name: "Lift Lab", category: "Strength", day: "Thursday", time: "6:15 AM", coach: "Leah Martin", duration: "50 min", image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?auto=format&fit=crop&w=900&q=85", alt: "Strength training with free weights" },
  { id: 8, name: "Flow", category: "Mobility", day: "Thursday", time: "12:30 PM", coach: "Sonia Khan", duration: "40 min", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=900&q=85", alt: "Calm yoga and movement class" },
  { id: 9, name: "Cardio Burn", category: "Cardio", day: "Friday", time: "7:00 AM", coach: "Daniel Ross", duration: "45 min", image: "https://images.unsplash.com/photo-1534258936925-c58bed479fcb?auto=format&fit=crop&w=900&q=85", alt: "Athlete running during cardio training" },
  { id: 10, name: "TRX", category: "Strength", day: "Friday", time: "12:15 PM", coach: "Leah Martin", duration: "45 min", image: "https://images.unsplash.com/photo-1599058917212-d750089bc07a?auto=format&fit=crop&w=900&q=85", alt: "Suspension training in a modern gym" },
  { id: 11, name: "Saturday Sweat", category: "HIIT", day: "Saturday", time: "9:00 AM", coach: "Tom Jackson", duration: "50 min", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=900&q=85", alt: "Trainer leading an energetic group workout" },
  { id: 12, name: "Sunday Reset", category: "Mobility", day: "Sunday", time: "10:30 AM", coach: "Sonia Khan", duration: "40 min", image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=85", alt: "Quiet morning yoga and mindfulness session" },
];

export const trainers = [
  { name: "Leah Martin", role: "Performance Coach", initials: "LM", image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&q=85", alt: "Leah Martin, performance coach" },
  { name: "Tom Jackson", role: "HIIT Specialist", initials: "TJ", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&q=85", alt: "Tom Jackson, HIIT specialist" },
  { name: "Sonia Khan", role: "Mobility Coach", initials: "SK", image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=640&q=85", alt: "Sonia Khan, mobility coach" },
  { name: "Daniel Ross", role: "Strength Mentor", initials: "DR", image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&q=85", alt: "Daniel Ross, strength mentor" },
];

export const memberships = [
  { tier: "Starter", price: 29, features: ["3 classes weekly", "Gym access"] },
  { tier: "Studio", price: 59, features: ["Unlimited classes", "1 coaching intro"], featured: true },
  { tier: "Performance", price: 89, features: ["Everything in Studio", "2 coaching sessions"] },
];
