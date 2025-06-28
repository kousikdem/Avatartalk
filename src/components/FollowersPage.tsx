
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Loader2,
  Calendar
} from 'lucide-react';
import { useFollows } from '@/hooks/useFollows';

const FollowersPage = () => {
  const { followers, following, loading, unfollowUser } = useFollows();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
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
                Followers & Following
              </h1>
              <p className="text-gray-600 mt-2">Manage your connections and discover new people</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" className="border-gray-300">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" className="border-gray-300">
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-600 text-sm font-medium">Followers</p>
                      <p className="text-3xl font-bold text-blue-700">{followers.length}</p>
                    </div>
                    <Users className="w-8 h-8 text-blue-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-600 text-sm font-medium">Following</p>
                      <p className="text-3xl font-bold text-green-700">{following.length}</p>
                    </div>
                    <UserPlus className="w-8 h-8 text-green-500" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-purple-600 text-sm font-medium">Engagement Rate</p>
                      <p className="text-3xl font-bold text-purple-700">
                        {followers.length > 0 ? Math.round((following.length / followers.length) * 100) : 0}%
                      </p>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Followers & Following Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Tabs defaultValue="followers" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="followers">
                  Followers ({followers.length})
                </TabsTrigger>
                <TabsTrigger value="following">
                  Following ({following.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="followers" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-blue-500" />
                      People Following You
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {followers.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No followers yet</p>
                        <p className="text-sm mt-2">Start creating great content to attract followers!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {followers.map((follow) => (
                          <div key={follow.id} className="p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={follow.follower?.avatar_url} alt={follow.follower?.full_name} />
                                <AvatarFallback>
                                  {follow.follower?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">
                                  {follow.follower?.full_name || 'Unknown User'}
                                </h3>
                                <p className="text-sm text-gray-500">{follow.follower?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-gray-500 text-sm">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>Followed {formatDate(follow.created_at)}</span>
                              </div>
                              <Badge variant="secondary">Follower</Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="following" className="mt-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-green-500" />
                      People You Follow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {following.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <UserPlus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Not following anyone yet</p>
                        <p className="text-sm mt-2">Discover and follow interesting people!</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {following.map((follow) => (
                          <div key={follow.id} className="p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-all">
                            <div className="flex items-center space-x-3 mb-3">
                              <Avatar className="w-12 h-12">
                                <AvatarImage src={follow.following?.avatar_url} alt={follow.following?.full_name} />
                                <AvatarFallback>
                                  {follow.following?.full_name?.split(' ').map(n => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-800">
                                  {follow.following?.full_name || 'Unknown User'}
                                </h3>
                                <p className="text-sm text-gray-500">{follow.following?.email}</p>
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-gray-500 text-sm">
                                <Calendar className="w-4 h-4 mr-1" />
                                <span>Following since {formatDate(follow.created_at)}</span>
                              </div>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-red-300 text-red-600 hover:bg-red-50"
                                onClick={() => unfollowUser(follow.following_id)}
                              >
                                <UserMinus className="w-4 h-4 mr-1" />
                                Unfollow
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default FollowersPage;
