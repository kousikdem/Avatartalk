
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { 
  Users,
  UserPlus,
  UserMinus,
  Search,
  Filter,
  MessageSquare,
  Eye,
  Calendar,
  MapPin,
  Globe,
  Star,
  TrendingUp
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location?: string;
  followers: number;
  following: number;
  posts: number;
  verified: boolean;
  isFollowing: boolean;
  lastActive: Date;
  joinedDate: Date;
  category: 'follower' | 'following' | 'visitor' | 'suggested';
}

const FollowersPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState<User[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      username: 'sarah_design',
      avatar: '/api/placeholder/64/64',
      bio: 'UI/UX Designer passionate about creating beautiful experiences',
      location: 'San Francisco, CA',
      followers: 1250,
      following: 345,
      posts: 89,
      verified: true,
      isFollowing: false,
      lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
      joinedDate: new Date(2023, 5, 15),
      category: 'follower'
    },
    {
      id: '2',
      name: 'Mike Chen',
      username: 'mike_dev',
      avatar: '/api/placeholder/64/64',
      bio: 'Full-stack developer | React enthusiast | Coffee addict ☕',
      location: 'New York, NY',
      followers: 892,
      following: 234,
      posts: 156,
      verified: false,
      isFollowing: true,
      lastActive: new Date(Date.now() - 30 * 60 * 1000),
      joinedDate: new Date(2023, 3, 22),
      category: 'following'
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      username: 'emily_marketing',
      avatar: '/api/placeholder/64/64',
      bio: 'Digital Marketing Strategist helping brands grow online',
      location: 'Los Angeles, CA',
      followers: 2156,
      following: 567,
      posts: 234,
      verified: true,
      isFollowing: false,
      lastActive: new Date(Date.now() - 5 * 60 * 1000),
      joinedDate: new Date(2022, 11, 8),
      category: 'visitor'
    },
    {
      id: '4',
      name: 'Alex Thompson',
      username: 'alex_photo',
      avatar: '/api/placeholder/64/64',
      bio: 'Professional photographer | Travel enthusiast | Nature lover 📸',
      location: 'Seattle, WA',
      followers: 3452,
      following: 123,
      posts: 567,
      verified: true,
      isFollowing: false,
      lastActive: new Date(Date.now() - 60 * 60 * 1000),
      joinedDate: new Date(2023, 1, 14),
      category: 'suggested'
    }
  ]);

  const handleFollow = (userId: string) => {
    setUsers(prev => 
      prev.map(user => 
        user.id === userId 
          ? { ...user, isFollowing: !user.isFollowing, followers: user.isFollowing ? user.followers - 1 : user.followers + 1 }
          : user
      )
    );
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const followers = filteredUsers.filter(user => user.category === 'follower');
  const following = filteredUsers.filter(user => user.category === 'following');
  const visitors = filteredUsers.filter(user => user.category === 'visitor');
  const suggested = filteredUsers.filter(user => user.category === 'suggested');

  const UserCard = ({ user }: { user: User }) => (
    <Card className="bg-white border border-gray-200 hover:border-blue-300 transition-all shadow-sm hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                {user.verified && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
              </div>
              <p className="text-gray-600 text-sm mb-2">@{user.username}</p>
              <p className="text-gray-700 text-sm mb-3">{user.bio}</p>
              
              {user.location && (
                <div className="flex items-center text-gray-500 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {user.location}
                </div>
              )}
              
              <div className="flex items-center text-gray-500 text-sm">
                <Calendar className="w-4 h-4 mr-1" />
                Joined {user.joinedDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>
          
          <div className="flex flex-col space-y-2">
            <Button
              size="sm"
              variant={user.isFollowing ? "outline" : "default"}
              className={user.isFollowing ? 'border-gray-300 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300' : 'gradient-button'}
              onClick={() => handleFollow(user.id)}
            >
              {user.isFollowing ? (
                <>
                  <UserMinus className="w-4 h-4 mr-2" />
                  Unfollow
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Follow
                </>
              )}
            </Button>
            
            <Button size="sm" variant="outline" className="border-gray-300">
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="font-semibold text-gray-900">{user.posts.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Posts</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{user.followers.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Followers</div>
          </div>
          <div>
            <div className="font-semibold text-gray-900">{user.following.toLocaleString()}</div>
            <div className="text-sm text-gray-500">Following</div>
          </div>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Last active {getTimeAgo(user.lastActive)}</span>
            <Badge variant="outline" className="border-gray-300 text-gray-600">
              {user.category.charAt(0).toUpperCase() + user.category.slice(1)}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Community
              </h1>
              <p className="text-gray-600 mt-2">Manage your followers and discover new connections</p>
            </div>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 border-gray-300"
                />
              </div>
              <Button variant="outline" className="border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-900">{followers.length}</div>
                <div className="text-sm text-blue-600">Followers</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6 text-center">
                <UserPlus className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-900">{following.length}</div>
                <div className="text-sm text-green-600">Following</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6 text-center">
                <Eye className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-900">{visitors.length}</div>
                <div className="text-sm text-purple-600">Recent Visitors</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-900">+12%</div>
                <div className="text-sm text-orange-600">Growth Rate</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="followers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100 border border-gray-200">
            <TabsTrigger value="followers" className="data-[state=active]:gradient-button">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following" className="data-[state=active]:gradient-button">
              Following ({following.length})
            </TabsTrigger>
            <TabsTrigger value="visitors" className="data-[state=active]:gradient-button">
              Visitors ({visitors.length})
            </TabsTrigger>
            <TabsTrigger value="suggested" className="data-[state=active]:gradient-button">
              Suggested ({suggested.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="space-y-6">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {followers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="following" className="space-y-6">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {following.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="visitors" className="space-y-6">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {visitors.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </motion.div>
          </TabsContent>

          <TabsContent value="suggested" className="space-y-6">
            <motion.div
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {suggested.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FollowersPage;
