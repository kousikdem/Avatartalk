// Demo data for landing page user profile showcase

export const demoPosts = [
  {
    id: 'demo-post-1',
    content: "Just launched my new AI-powered avatar! 🚀 It can answer questions about my work 24/7. Check out how I trained it to match my personality perfectly!",
    media_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    media_type: 'image/jpeg',
    likes_count: 247,
    comments_count: 43,
    views_count: 1892,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    is_subscriber_only: false,
    profile: {
      username: 'demouser',
      display_name: 'Demo Avatar',
      avatar_url: undefined
    }
  },
  {
    id: 'demo-post-2',
    content: "🔐 EXCLUSIVE: Behind-the-scenes look at my AI training process! Learn the secret prompts and techniques I use to make my avatar sound exactly like me...",
    media_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=300&fit=crop',
    media_type: 'image/jpeg',
    likes_count: 412,
    comments_count: 89,
    views_count: 3241,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    is_subscriber_only: true,
    profile: {
      username: 'demouser',
      display_name: 'Demo Avatar',
      avatar_url: undefined
    }
  },
  {
    id: 'demo-post-3',
    content: "New tutorial on AI training coming soon! 🎯 Learn how to create a personal AI that truly represents your brand. Drop a 🔥 if you're interested!",
    likes_count: 156,
    comments_count: 28,
    views_count: 1247,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    is_subscriber_only: false,
    profile: {
      username: 'demouser',
      display_name: 'Demo Avatar',
      avatar_url: undefined
    }
  },
  {
    id: 'demo-post-4',
    content: "The future of personal branding is here! 💡 Your AI avatar can handle customer inquiries, book appointments, and share your content - all while you sleep.",
    media_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    media_type: 'image/jpeg',
    likes_count: 312,
    comments_count: 67,
    views_count: 2543,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    is_subscriber_only: false,
    profile: {
      username: 'demouser',
      display_name: 'Demo Avatar',
      avatar_url: undefined
    }
  }
];

export const demoProducts = [
  {
    id: 'demo-product-1',
    title: 'AI Consultation Package',
    description: '60-minute personalized AI strategy session to boost your brand presence',
    price: 4999,
    compare_at_price: 7999,
    thumbnail_url: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=400&h=300&fit=crop',
    product_type: 'digital' as const,
    is_free: false,
    is_paid: true,
    rating: 4.9,
    reviews_count: 127,
    views_count: 2341,
    category: 'Consultation'
  },
  {
    id: 'demo-product-2',
    title: 'Avatar Design Masterclass',
    description: 'Complete guide to creating stunning 3D avatars from scratch',
    price: 2499,
    compare_at_price: 4999,
    thumbnail_url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=300&fit=crop',
    product_type: 'digital' as const,
    is_free: false,
    is_paid: true,
    rating: 4.8,
    reviews_count: 89,
    views_count: 1876,
    category: 'Course'
  },
  {
    id: 'demo-product-3',
    title: 'AI Training Templates',
    description: 'Ready-to-use templates for training your AI personality',
    price: 0,
    thumbnail_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=300&fit=crop',
    product_type: 'digital' as const,
    is_free: true,
    rating: 4.7,
    reviews_count: 234,
    views_count: 4521,
    category: 'Templates'
  }
];

export const demoVirtualCollabProducts = [
  {
    id: 'demo-collab-1',
    title: '1-on-1 AI Strategy Call',
    description: 'Personal consultation on implementing AI avatars for your business',
    price: 9999,
    compare_at_price: 14999,
    thumbnail_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop',
    product_type: 'virtual_meeting' as const,
    is_free: false,
    is_paid: true,
    rating: 5.0,
    reviews_count: 45,
    views_count: 892,
    category: 'Virtual Meeting'
  },
  {
    id: 'demo-collab-2',
    title: 'Group Workshop: AI Branding',
    description: 'Live interactive workshop for teams to learn AI-powered branding',
    price: 4999,
    thumbnail_url: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=400&h=300&fit=crop',
    product_type: 'virtual_meeting' as const,
    is_free: false,
    rating: 4.9,
    reviews_count: 78,
    views_count: 1245,
    category: 'Workshop'
  }
];
