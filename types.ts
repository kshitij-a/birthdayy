
export interface Memory {
  id: string;
  description: string;
  date: string;
  location: string;
  importance: string; // Used for the "Special Reveal" light box
  details: string;
}

export interface Wish {
  id: string;
  content: string; // Used as Title
  importance: string;
  details: string; // Used as Description
}

export type RelationshipType = 'partner' | 'friend' | 'spouse' | 'sibling' | 'parent' | 'other';
export type VisualStyle = 
  'neon' | 'sakura' | 'cosmic' | 'ocean' | 'sunset' | 
  'vintage' | 'forest' | 'glitch' | 'elegant' | 'clouds' | 
  'minimal' | 'polaroid' | 'midnight' | 'loveletter';

export interface BirthdayData {
  id: string; // Unique ID for the generated page
  createdAt?: string; // Timestamp for history
  basics: {
    recipientName: string;
    senderName: string;
    relationship: RelationshipType;
    nickname: string;
  };
  memories: Memory[];
  wishes: Wish[];
  specialItems: {
    gifts: string;
    insideJokes: string;
    treasuredItems: string;
  };
  personality: {
    interests: string;
    uniqueness: string;
    admiration: string;
    dreams: string;
  };
  journey: {
    meetingStory: string;
    duration: string;
    milestones: string;
    moments: string;
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    emojiPreference: string[]; // e.g. ['❤️', '✨']
    visualStyle: VisualStyle;
  };
  message: {
    main: string;
    signOff: string;
    quote: string;
  };
}

export const INITIAL_DATA: BirthdayData = {
  id: '',
  basics: { recipientName: '', senderName: '', relationship: 'partner', nickname: '' },
  memories: [],
  wishes: [],
  specialItems: { gifts: '', insideJokes: '', treasuredItems: '' },
  personality: { interests: '', uniqueness: '', admiration: '', dreams: '' },
  journey: { meetingStory: '', duration: '', milestones: '', moments: '' },
  design: { 
    primaryColor: '#ff1493', 
    secondaryColor: '#ff69b4', 
    emojiPreference: ['❤️', '✨', '🎂'], 
    visualStyle: 'neon' 
  },
  message: { main: '', signOff: '', quote: '' }
};
