
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import AvatarPreview from './AvatarPreview';

const SetupWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [personality, setPersonality] = useState([50]);
  const totalSteps = 5;

  const steps = [
    { title: "Avatar Look", description: "Customize your avatar's appearance" },
    { title: "Voice", description: "Choose your avatar's voice" },
    { title: "Bio", description: "Tell us about yourself" },
    { title: "Personality", description: "Set your avatar's personality" },
    { title: "Publish", description: "Make your profile live" }
  ];

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Progress Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Setup Your Avatar</h1>
          <p className="text-gray-400 mb-6">Step {currentStep} of {totalSteps}: {steps[currentStep - 1].description}</p>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Column */}
          <div className="flex justify-center lg:justify-end">
            <div className="w-full max-w-sm">
              <Card className="bg-gray-900/50 border-gray-800 mb-4">
                <CardHeader>
                  <CardTitle className="text-white text-center">Preview</CardTitle>
                </CardHeader>
                <CardContent className="flex justify-center">
                  <AvatarPreview isLarge={true} showControls={true} />
                </CardContent>
              </Card>
              
              {/* Step indicators */}
              <div className="space-y-2">
                {steps.map((step, index) => (
                  <div 
                    key={index}
                    className={`flex items-center space-x-3 p-2 rounded-lg ${
                      index + 1 === currentStep 
                        ? 'bg-blue-600/20 border border-blue-600/30' 
                        : index + 1 < currentStep 
                          ? 'bg-green-600/20 border border-green-600/30'
                          : 'bg-gray-800/50 border border-gray-700'
                    }`}
                  >
                    {index + 1 < currentStep ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <div className={`w-5 h-5 rounded-full border-2 ${
                        index + 1 === currentStep ? 'border-blue-400 bg-blue-400/20' : 'border-gray-600'
                      }`} />
                    )}
                    <span className="text-white text-sm">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Setup Column */}
          <div>
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-white">{steps[currentStep - 1].title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Step 1: Avatar Look */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Avatar Style</Label>
                      <Select defaultValue="realistic">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="realistic">Realistic</SelectItem>
                          <SelectItem value="cartoon">Cartoon</SelectItem>
                          <SelectItem value="anime">Anime</SelectItem>
                          <SelectItem value="minimal">Minimal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Hair Style</Label>
                        <Select defaultValue="bob">
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="bob">Bob Cut</SelectItem>
                            <SelectItem value="long">Long Hair</SelectItem>
                            <SelectItem value="short">Short Hair</SelectItem>
                            <SelectItem value="curly">Curly Hair</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Clothing</Label>
                        <Select defaultValue="business">
                          <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="casual">Casual</SelectItem>
                            <SelectItem value="formal">Formal</SelectItem>
                            <SelectItem value="creative">Creative</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 2: Voice */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Voice Type</Label>
                      <Select defaultValue="female-professional">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="female-professional">Female Professional</SelectItem>
                          <SelectItem value="male-friendly">Male Friendly</SelectItem>
                          <SelectItem value="female-energetic">Female Energetic</SelectItem>
                          <SelectItem value="male-calm">Male Calm</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-gray-300">Speaking Speed</Label>
                      <Select defaultValue="normal">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="slow">Slow</SelectItem>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="fast">Fast</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Preview Voice
                    </Button>
                  </div>
                )}

                {/* Step 3: Bio */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="displayName" className="text-gray-300">Display Name</Label>
                      <Input 
                        id="displayName" 
                        placeholder="Your name" 
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="role" className="text-gray-300">Your Role</Label>
                      <Select>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select your role" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="creator">Creator</SelectItem>
                          <SelectItem value="coach">Coach</SelectItem>
                          <SelectItem value="artist">Artist</SelectItem>
                          <SelectItem value="consultant">Consultant</SelectItem>
                          <SelectItem value="educator">Educator</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="bio" className="text-gray-300">Bio</Label>
                      <Textarea 
                        id="bio" 
                        placeholder="Tell visitors about yourself..."
                        className="bg-gray-800 border-gray-700 text-white"
                        rows={3}
                      />
                    </div>
                  </div>
                )}

                {/* Step 4: Personality */}
                {currentStep === 4 && (
                  <div className="space-y-6">
                    <div>
                      <Label className="text-gray-300 mb-4 block">
                        Communication Style: Friendly ← → Formal
                      </Label>
                      <Slider
                        value={personality}
                        onValueChange={setPersonality}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-400 mt-2">
                        <span>Very Friendly</span>
                        <span>Balanced</span>
                        <span>Very Formal</span>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300">Response Length</Label>
                      <Select defaultValue="medium">
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="short">Short & Concise</SelectItem>
                          <SelectItem value="medium">Medium Length</SelectItem>
                          <SelectItem value="detailed">Detailed & Comprehensive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}

                {/* Step 5: Publish */}
                {currentStep === 5 && (
                  <div className="space-y-4">
                    <div className="text-center">
                      <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold text-white mb-2">You're All Set!</h3>
                      <p className="text-gray-400 mb-6">
                        Your avatar is ready to engage with visitors. You can always customize it later.
                      </p>
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg">
                      <Label className="text-gray-300">Your Avatar URL</Label>
                      <div className="flex mt-2">
                        <Input 
                          value="avatartalk.bio/your-username" 
                          readOnly 
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                        <Button variant="outline" className="ml-2">Copy</Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6">
                  <Button 
                    variant="outline" 
                    onClick={prevStep}
                    disabled={currentStep === 1}
                    className="border-gray-600 text-gray-300"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Previous
                  </Button>
                  
                  {currentStep === totalSteps ? (
                    <Button className="bg-green-600 hover:bg-green-700">
                      Publish Avatar
                    </Button>
                  ) : (
                    <Button onClick={nextStep} className="bg-blue-600 hover:bg-blue-700">
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SetupWizard;
