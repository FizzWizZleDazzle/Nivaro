import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  CheckCircleIcon, 
  UserIcon, 
  UserGroupIcon, 
  SparklesIcon,
  AcademicCapIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  PhotoIcon,
  PlusIcon,
  TrashIcon,
  GlobeAltIcon,
  HashtagIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'
import { CheckIcon } from '@heroicons/react/24/solid'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<any>
  completed: boolean
}

interface ProfileData {
  name: string
  bio: string
  avatar?: File
  avatarPreview?: string
  skills: string[]
  interests: string[]
  socialLinks: {
    github?: string
    linkedin?: string
    twitter?: string
    website?: string
  }
}

interface ClubChoice {
  type: 'create' | 'join' | null
  clubName?: string
  clubDescription?: string
  inviteCode?: string
}

export default function Onboarding() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Step-specific state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: user?.name || '',
    bio: '',
    skills: [],
    interests: [],
    socialLinks: {}
  })
  
  const [clubChoice, setClubChoice] = useState<ClubChoice>({
    type: null
  })
  
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    meetingReminders: true,
    weeklyDigest: false,
    publicProfile: true
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Nivaro',
      description: 'Let\'s get your account set up',
      icon: SparklesIcon,
      completed: false
    },
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Tell us about yourself',
      icon: UserIcon,
      completed: false
    },
    {
      id: 'club',
      title: 'Join or Create a Club',
      description: 'Connect with your learning community',
      icon: UserGroupIcon,
      completed: false
    },
    {
      id: 'preferences',
      title: 'Set Your Preferences',
      description: 'Customize your experience',
      icon: AcademicCapIcon,
      completed: false
    },
    {
      id: 'complete',
      title: 'You\'re All Set!',
      description: 'Start exploring Nivaro',
      icon: CheckCircleIcon,
      completed: false
    }
  ]

  // Profile step handlers
  const [newSkill, setNewSkill] = useState('')
  const [newInterest, setNewInterest] = useState('')

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          avatar: file,
          avatarPreview: reader.result as string
        }))
      }
      reader.readAsDataURL(file)
    }
  }

  const addSkill = () => {
    if (newSkill.trim() && !profileData.skills.includes(newSkill.trim())) {
      setProfileData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setProfileData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const addInterest = () => {
    if (newInterest.trim() && !profileData.interests.includes(newInterest.trim())) {
      setProfileData(prev => ({
        ...prev,
        interests: [...prev.interests, newInterest.trim()]
      }))
      setNewInterest('')
    }
  }

  const removeInterest = (interest: string) => {
    setProfileData(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }))
  }

  // Navigation handlers
  const handleNext = async () => {
    setError(null)
    
    // Validate current step
    if (currentStep === 1) {
      if (!profileData.name.trim()) {
        setError('Please enter your name')
        return
      }
      if (profileData.bio.length < 10) {
        setError('Please write a brief bio (at least 10 characters)')
        return
      }
    }
    
    if (currentStep === 2) {
      if (!clubChoice.type) {
        setError('Please choose to create or join a club')
        return
      }
      if (clubChoice.type === 'create' && !clubChoice.clubName?.trim()) {
        setError('Please enter a club name')
        return
      }
      if (clubChoice.type === 'join' && !clubChoice.inviteCode?.trim()) {
        setError('Please enter an invite code')
        return
      }
    }
    
    // Save data at certain steps
    if (currentStep === 1) {
      await saveProfile()
    } else if (currentStep === 2) {
      await handleClubAction()
    } else if (currentStep === 3) {
      await savePreferences()
    }
    
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const handleSkip = () => {
    if (currentStep === 2) {
      // Allow skipping club creation/joining
      setCurrentStep(prev => prev + 1)
    }
  }

  const saveProfile = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData()
      formData.append('name', profileData.name)
      formData.append('bio', profileData.bio)
      formData.append('skills', JSON.stringify(profileData.skills))
      formData.append('interests', JSON.stringify(profileData.interests))
      formData.append('social_links', JSON.stringify(profileData.socialLinks))
      
      if (profileData.avatar) {
        formData.append('avatar', profileData.avatar)
      }

      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error('Failed to update profile')
      }

      const data = await response.json()
      if (data.data) {
        updateUser(data.data)
      }
    } catch (err) {
      console.error('Profile update error:', err)
      setError('Failed to save profile. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const handleClubAction = async () => {
    if (!clubChoice.type) return
    
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      
      if (clubChoice.type === 'create') {
        const response = await fetch('/api/clubs', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
          },
          body: JSON.stringify({
            name: clubChoice.clubName,
            description: clubChoice.clubDescription || '',
            category: 'general',
            privacy: 'public'
          })
        })

        if (!response.ok) {
          throw new Error('Failed to create club')
        }
      } else if (clubChoice.type === 'join') {
        const response = await fetch('/api/clubs/join', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
          },
          body: JSON.stringify({
            invite_code: clubChoice.inviteCode
          })
        })

        if (!response.ok) {
          const data = await response.json()
          throw new Error(data.error || 'Failed to join club')
        }
      }
    } catch (err: any) {
      console.error('Club action error:', err)
      setError(err.message || 'Failed to process club action. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const savePreferences = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
        },
        body: JSON.stringify({
          preferences: {
            notifications: {
              email: preferences.emailNotifications,
              meeting_reminders: preferences.meetingReminders,
              weekly_digest: preferences.weeklyDigest
            },
            privacy: {
              public_profile: preferences.publicProfile
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save preferences')
      }
    } catch (err) {
      console.error('Preferences save error:', err)
      setError('Failed to save preferences. Please try again.')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async () => {
    setIsLoading(true)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/profile/complete-onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'X-CSRF-Token': localStorage.getItem('csrf_token') || ''
        }
      })

      if (!response.ok) {
        throw new Error('Failed to complete onboarding')
      }

      // Navigate to dashboard
      navigate('/dashboard')
    } catch (err) {
      console.error('Complete onboarding error:', err)
      setError('Failed to complete onboarding. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="text-center py-12">
            <SparklesIcon className="h-24 w-24 text-indigo-600 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Nivaro, {user?.name || 'Friend'}!
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              We're excited to have you join our learning community. Let's take a few minutes 
              to set up your account and get you connected with the right people.
            </p>
            <div className="space-y-4 max-w-md mx-auto text-left">
              <div className="flex items-start space-x-3">
                <CheckIcon className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Personalize your profile</p>
                  <p className="text-sm text-gray-600">Share your skills and interests</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckIcon className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Join or create a club</p>
                  <p className="text-sm text-gray-600">Connect with like-minded learners</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <CheckIcon className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Customize your experience</p>
                  <p className="text-sm text-gray-600">Set your preferences and notifications</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 1: // Profile
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Complete Your Profile</h2>
            
            {/* Avatar Upload */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Profile Photo
              </label>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {profileData.avatarPreview ? (
                    <img
                      src={profileData.avatarPreview}
                      alt="Avatar preview"
                      className="h-24 w-24 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center">
                      <PhotoIcon className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <label className="cursor-pointer bg-white px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                    <span>Change Photo</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </label>
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Name
              </label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Your name"
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Tell us about yourself..."
              />
            </div>

            {/* Skills */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Skills
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add a skill..."
                />
                <button
                  onClick={addSkill}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {skill}
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-2 text-indigo-600 hover:text-indigo-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Interests */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              <div className="flex items-center space-x-2 mb-3">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInterest())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Add an interest..."
                />
                <button
                  onClick={addInterest}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {profileData.interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Social Links (Optional)
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <HashtagIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.socialLinks.github || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, github: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="GitHub username"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <HashtagIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.socialLinks.linkedin || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, linkedin: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="LinkedIn profile"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <HashtagIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.socialLinks.twitter || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Twitter handle"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={profileData.socialLinks.website || ''}
                    onChange={(e) => setProfileData(prev => ({
                      ...prev,
                      socialLinks: { ...prev.socialLinks, website: e.target.value }
                    }))}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Personal website"
                  />
                </div>
              </div>
            </div>
          </div>
        )

      case 2: // Club
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Your Learning Community</h2>
            
            {!clubChoice.type ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  onClick={() => setClubChoice({ type: 'create' })}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors text-left"
                >
                  <UserGroupIcon className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Create a New Club</h3>
                  <p className="text-gray-600">
                    Start your own learning community and invite others to join
                  </p>
                </button>
                
                <button
                  onClick={() => setClubChoice({ type: 'join' })}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-indigo-500 transition-colors text-left"
                >
                  <EnvelopeIcon className="h-12 w-12 text-indigo-600 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Join Existing Club</h3>
                  <p className="text-gray-600">
                    Enter an invite code to join an existing club
                  </p>
                </button>
              </div>
            ) : clubChoice.type === 'create' ? (
              <div className="space-y-6">
                <button
                  onClick={() => setClubChoice({ type: null })}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to options</span>
                </button>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Club Name
                  </label>
                  <input
                    type="text"
                    value={clubChoice.clubName || ''}
                    onChange={(e) => setClubChoice(prev => ({ ...prev, clubName: e.target.value }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter club name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={clubChoice.clubDescription || ''}
                    onChange={(e) => setClubChoice(prev => ({ ...prev, clubDescription: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="What's your club about?"
                  />
                </div>
                
                <div className="bg-blue-50 border-l-4 border-blue-400 p-4">
                  <p className="text-sm text-blue-700">
                    After creating your club, you'll receive an invite code to share with others
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <button
                  onClick={() => setClubChoice({ type: null })}
                  className="text-indigo-600 hover:text-indigo-800 flex items-center space-x-2"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span>Back to options</span>
                </button>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Invite Code
                  </label>
                  <input
                    type="text"
                    value={clubChoice.inviteCode || ''}
                    onChange={(e) => setClubChoice(prev => ({ ...prev, inviteCode: e.target.value.toUpperCase() }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl font-mono"
                    placeholder="ENTER-CODE"
                    maxLength={10}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Ask your club admin for the invite code
                  </p>
                </div>
              </div>
            )}
          </div>
        )

      case 3: // Preferences
        return (
          <div className="py-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Customize Your Experience</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Notifications</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Email Notifications</p>
                      <p className="text-sm text-gray-500">Receive updates about your clubs and courses</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications}
                      onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Meeting Reminders</p>
                      <p className="text-sm text-gray-500">Get notified before scheduled meetings</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.meetingReminders}
                      onChange={(e) => setPreferences(prev => ({ ...prev, meetingReminders: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Weekly Digest</p>
                      <p className="text-sm text-gray-500">Summary of club activities and updates</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.weeklyDigest}
                      onChange={(e) => setPreferences(prev => ({ ...prev, weeklyDigest: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Privacy</h3>
                <div className="space-y-4">
                  <label className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700">Public Profile</p>
                      <p className="text-sm text-gray-500">Allow others to see your profile and activities</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={preferences.publicProfile}
                      onChange={(e) => setPreferences(prev => ({ ...prev, publicProfile: e.target.checked }))}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>
        )

      case 4: // Complete
        return (
          <div className="text-center py-12">
            <CheckCircleIcon className="h-24 w-24 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              You're All Set!
            </h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Your account is fully configured. You're ready to start your learning journey with Nivaro.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-8">
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
                  <AcademicCapIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Browse Courses</h3>
                <p className="text-sm text-gray-600 mt-1">Explore our learning catalog</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
                  <UserGroupIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Connect</h3>
                <p className="text-sm text-gray-600 mt-1">Meet your club members</p>
              </div>
              
              <div className="text-center">
                <div className="bg-indigo-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-3">
                  <SparklesIcon className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Start Learning</h3>
                <p className="text-sm text-gray-600 mt-1">Begin your first course</p>
              </div>
            </div>
            
            <button
              onClick={completeOnboarding}
              disabled={isLoading}
              className="px-8 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg"
            >
              {isLoading ? 'Finishing Setup...' : 'Go to Dashboard'}
            </button>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center ${index < steps.length - 1 ? 'flex-1' : ''}`}
              >
                <div className="relative">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-green-500'
                        : index === currentStep
                        ? 'bg-indigo-600'
                        : 'bg-gray-300'
                    }`}
                  >
                    {index < currentStep ? (
                      <CheckIcon className="h-6 w-6 text-white" />
                    ) : (
                      <span className="text-white font-semibold">{index + 1}</span>
                    )}
                  </div>
                  {index === currentStep && (
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-indigo-600 whitespace-nowrap">
                      {step.title}
                    </span>
                  )}
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 text-red-700">
              <p>{error}</p>
            </div>
          )}
          
          {renderStepContent()}
          
          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8">
            <button
              onClick={handleBack}
              disabled={currentStep === 0 || isLoading}
              className={`px-6 py-2 rounded-lg font-medium ${
                currentStep === 0
                  ? 'invisible'
                  : 'text-gray-700 border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <ArrowLeftIcon className="h-5 w-5 inline mr-2" />
              Back
            </button>
            
            <div className="flex space-x-3">
              {currentStep === 2 && (
                <button
                  onClick={handleSkip}
                  disabled={isLoading}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Skip for now
                </button>
              )}
              
              {currentStep < steps.length - 1 && (
                <button
                  onClick={handleNext}
                  disabled={isLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  <span>{isLoading ? 'Saving...' : 'Continue'}</span>
                  <ArrowRightIcon className="h-5 w-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}