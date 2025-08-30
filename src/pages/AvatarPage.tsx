
import React from 'react';
import { User, Palette, Download, Save, Plus, Edit, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

const AvatarPage = () => {
  const navigate = useNavigate();

  return (
    <div className="p-4 md:p-6 w-full max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          Avatar Management
        </h1>
        <p className="text-gray-600 text-lg">Manage your 3D avatars for AvatarTalk.bio</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Create New Avatar */}
        <Card className="lg:col-span-1 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:shadow-lg transition-all cursor-pointer group">
          <CardHeader className="text-center pb-4">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl">Create New Avatar</CardTitle>
            <CardDescription>
              Build a custom 3D avatar from scratch
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button 
              onClick={() => navigate('/avatar/create')}
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Creating
            </Button>
          </CardContent>
        </Card>

        {/* Current Avatar Preview */}
        <Card className="lg:col-span-2 border-0 bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Current Avatar
            </CardTitle>
            <CardDescription>
              Your active avatar for AvatarTalk.bio
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-6">
              <div className="text-center">
                <User className="w-24 h-24 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg font-medium">No Avatar Created Yet</p>
                <p className="text-gray-400 text-sm">Create your first avatar to get started</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/avatar/create')}
                className="flex-1"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Avatar
              </Button>
              <Button variant="outline" className="flex-1" disabled>
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button variant="outline" disabled>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Avatar Library */}
      <div className="mt-8">
        <Card className="border-0 bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Avatar Library
            </CardTitle>
            <CardDescription>
              Your saved avatar presets and variations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Placeholder for saved avatars */}
              {Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="bg-gray-50 border-dashed border-2 border-gray-200">
                  <CardContent className="p-4 text-center">
                    <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                      <User className="w-8 h-8 text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-400">Empty Slot</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full mt-2"
                      onClick={() => navigate('/avatar/create')}
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Create
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Features Overview */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 bg-gradient-to-br from-green-50 to-emerald-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Realistic 3D Models</h3>
            <p className="text-sm text-gray-600">High-quality 3D avatars with realistic proportions and features</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-blue-50 to-cyan-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Palette className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Full Customization</h3>
            <p className="text-sm text-gray-600">Customize every aspect from body type to clothing and accessories</p>
          </CardContent>
        </Card>
        
        <Card className="border-0 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold mb-2">Export Ready</h3>
            <p className="text-sm text-gray-600">Download your avatar for use in other platforms and applications</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AvatarPage;
