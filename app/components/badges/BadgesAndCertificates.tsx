'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Trophy, 
  Award, 
  Star, 
  Target,
  CheckCircle,
  Download,
  Eye,
  Plus,
  Lock,
  Unlock
} from 'lucide-react';

interface Badge {
  id: string;
  name: string;
  description: string;
  icon_url?: string;
  criteria: BadgeCriteria;
  created_at: string;
  earned?: boolean;
  earned_at?: string;
}

interface BadgeCriteria {
  type: 'completion' | 'score' | 'participation' | 'custom';
  requirement: string;
  threshold?: number;
}

interface Certificate {
  id: string;
  curriculum_id: string;
  curriculum_title: string;
  user_name: string;
  completion_date: string;
  verification_code: string;
  grade?: string;
}

interface BadgesAndCertificatesProps {
  clubId: string;
  isOwner: boolean;
}

export default function BadgesAndCertificates({ clubId, isOwner }: BadgesAndCertificatesProps) {
  const { user } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [activeTab, setActiveTab] = useState<'badges' | 'certificates'>('badges');
  const [showCreateBadge, setShowCreateBadge] = useState(false);
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  
  const [badgeForm, setBadgeForm] = useState({
    name: '',
    description: '',
    type: 'completion' as BadgeCriteria['type'],
    requirement: '',
    threshold: 80
  });

  // Sample badges for demonstration
  const sampleBadges: Badge[] = [
    {
      id: '1',
      name: 'Quick Learner',
      description: 'Complete 5 lessons in one week',
      criteria: {
        type: 'completion',
        requirement: 'Complete 5 lessons within 7 days',
        threshold: 5
      },
      created_at: new Date().toISOString(),
      earned: true,
      earned_at: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: '2',
      name: 'Perfect Score',
      description: 'Achieve 100% on any assignment',
      criteria: {
        type: 'score',
        requirement: 'Score 100% on an assignment',
        threshold: 100
      },
      created_at: new Date().toISOString(),
      earned: true,
      earned_at: new Date(Date.now() - 86400000 * 7).toISOString()
    },
    {
      id: '3',
      name: 'Team Player',
      description: 'Complete 10 peer reviews',
      criteria: {
        type: 'participation',
        requirement: 'Complete 10 peer reviews',
        threshold: 10
      },
      created_at: new Date().toISOString(),
      earned: false
    },
    {
      id: '4',
      name: 'Course Champion',
      description: 'Complete entire curriculum with 90%+ average',
      criteria: {
        type: 'completion',
        requirement: 'Complete all modules with 90% or higher',
        threshold: 90
      },
      created_at: new Date().toISOString(),
      earned: false
    }
  ];

  const sampleCertificate: Certificate = {
    id: '1',
    curriculum_id: 'curr_1',
    curriculum_title: 'Introduction to Web Development',
    user_name: user?.name || 'Student Name',
    completion_date: new Date().toISOString(),
    verification_code: 'CURS-2024-WEB-001',
    grade: 'A'
  };

  useEffect(() => {
    // Load badges and certificates
    setBadges(sampleBadges);
    setCertificates([sampleCertificate]);
  }, [clubId]);

  const handleCreateBadge = () => {
    const newBadge: Badge = {
      id: Date.now().toString(),
      name: badgeForm.name,
      description: badgeForm.description,
      criteria: {
        type: badgeForm.type,
        requirement: badgeForm.requirement,
        threshold: badgeForm.threshold
      },
      created_at: new Date().toISOString(),
      earned: false
    };
    
    setBadges([...badges, newBadge]);
    setShowCreateBadge(false);
    setBadgeForm({
      name: '',
      description: '',
      type: 'completion',
      requirement: '',
      threshold: 80
    });
  };

  const generateCertificate = (certificate: Certificate) => {
    // This would normally generate a PDF or image
    const certHtml = `
      <div style="border: 3px solid #4F46E5; padding: 40px; text-align: center; max-width: 800px; margin: auto; font-family: serif;">
        <h1 style="color: #4F46E5; font-size: 48px; margin-bottom: 20px;">Certificate of Completion</h1>
        <p style="font-size: 20px; margin: 20px 0;">This is to certify that</p>
        <h2 style="font-size: 36px; margin: 20px 0;">${certificate.user_name}</h2>
        <p style="font-size: 20px; margin: 20px 0;">has successfully completed</p>
        <h3 style="font-size: 28px; margin: 20px 0; color: #4F46E5;">${certificate.curriculum_title}</h3>
        <p style="font-size: 18px; margin: 30px 0;">
          Date: ${new Date(certificate.completion_date).toLocaleDateString()}<br/>
          ${certificate.grade ? `Grade: ${certificate.grade}<br/>` : ''}
          Verification Code: ${certificate.verification_code}
        </p>
        <div style="margin-top: 40px; font-size: 16px;">
          <div style="display: inline-block; margin: 0 40px;">
            <p style="border-top: 2px solid #000; padding-top: 10px; margin-top: 40px;">Instructor Signature</p>
          </div>
          <div style="display: inline-block; margin: 0 40px;">
            <p style="border-top: 2px solid #000; padding-top: 10px; margin-top: 40px;">Director Signature</p>
          </div>
        </div>
      </div>
    `;
    
    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(certHtml);
      newWindow.document.close();
      newWindow.print();
    }
  };

  const getBadgeIcon = (earned: boolean) => {
    if (earned) {
      return <Trophy className="w-8 h-8 text-yellow-500" />;
    }
    return <Lock className="w-8 h-8 text-gray-400" />;
  };

  const earnedBadges = badges.filter(b => b.earned);
  const availableBadges = badges.filter(b => !b.earned);

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('badges')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'badges'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Trophy className="w-4 h-4 mr-2" />
            Badges ({earnedBadges.length}/{badges.length})
          </button>
          <button
            onClick={() => setActiveTab('certificates')}
            className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
              activeTab === 'certificates'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Award className="w-4 h-4 mr-2" />
            Certificates ({certificates.length})
          </button>
        </nav>
      </div>

      {activeTab === 'badges' ? (
        <div>
          {/* Badge Stats */}
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600">{earnedBadges.length}</div>
                <div className="text-sm text-gray-600">Badges Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">{availableBadges.length}</div>
                <div className="text-sm text-gray-600">Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-500">
                  {Math.round((earnedBadges.length / badges.length) * 100) || 0}%
                </div>
                <div className="text-sm text-gray-600">Completion</div>
              </div>
              <div className="text-center">
                <div className="flex justify-center space-x-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star 
                      key={i} 
                      className={`w-6 h-6 ${i <= Math.ceil(earnedBadges.length / 2) ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                    />
                  ))}
                </div>
                <div className="text-sm text-gray-600">Level</div>
              </div>
            </div>
          </div>

          {/* Create Badge (Owner only) */}
          {isOwner && (
            <div className="mb-6">
              {showCreateBadge ? (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Badge</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Badge Name</label>
                      <input
                        type="text"
                        value={badgeForm.name}
                        onChange={(e) => setBadgeForm({ ...badgeForm, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="e.g., Quick Learner"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Description</label>
                      <input
                        type="text"
                        value={badgeForm.description}
                        onChange={(e) => setBadgeForm({ ...badgeForm, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="What does this badge represent?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Badge Type</label>
                      <select
                        value={badgeForm.type}
                        onChange={(e) => setBadgeForm({ ...badgeForm, type: e.target.value as BadgeCriteria['type'] })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                      >
                        <option value="completion">Completion-based</option>
                        <option value="score">Score-based</option>
                        <option value="participation">Participation-based</option>
                        <option value="custom">Custom criteria</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Requirement</label>
                      <input
                        type="text"
                        value={badgeForm.requirement}
                        onChange={(e) => setBadgeForm({ ...badgeForm, requirement: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                        placeholder="Describe the requirement to earn this badge"
                      />
                    </div>
                    {(badgeForm.type === 'score' || badgeForm.type === 'completion') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Threshold (%)</label>
                        <input
                          type="number"
                          value={badgeForm.threshold}
                          onChange={(e) => setBadgeForm({ ...badgeForm, threshold: parseInt(e.target.value) })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                          min="0"
                          max="100"
                        />
                      </div>
                    )}
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => setShowCreateBadge(false)}
                        className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleCreateBadge}
                        className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Create Badge
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowCreateBadge(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Badge
                </button>
              )}
            </div>
          )}

          {/* Badges Grid */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Your Badges</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`bg-white rounded-lg shadow p-6 border-2 ${
                    badge.earned ? 'border-yellow-400' : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    {getBadgeIcon(badge.earned || false)}
                    {badge.earned && (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    )}
                  </div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">{badge.name}</h4>
                  <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                  <div className="border-t pt-3">
                    <p className="text-xs text-gray-500">
                      <strong>Requirement:</strong> {badge.criteria.requirement}
                    </p>
                    {badge.earned && badge.earned_at && (
                      <p className="text-xs text-green-600 mt-2">
                        Earned on {new Date(badge.earned_at).toLocaleDateString()}
                      </p>
                    )}
                    {!badge.earned && badge.criteria.threshold && (
                      <div className="mt-2">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>0/{badge.criteria.threshold}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '0%' }}></div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        // Certificates Tab
        <div>
          {certificates.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Award className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No certificates yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Complete a curriculum to earn your first certificate!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {certificates.map((certificate) => (
                <div key={certificate.id} className="bg-white rounded-lg shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className="flex-shrink-0">
                          <Award className="w-12 h-12 text-indigo-600" />
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            Certificate of Completion
                          </h3>
                          <p className="text-gray-600 mt-1">
                            {certificate.curriculum_title}
                          </p>
                          <div className="mt-3 space-y-1 text-sm text-gray-500">
                            <p>Awarded to: {certificate.user_name}</p>
                            <p>Date: {new Date(certificate.completion_date).toLocaleDateString()}</p>
                            {certificate.grade && <p>Grade: {certificate.grade}</p>}
                            <p>Verification Code: <code className="bg-gray-100 px-1 rounded">{certificate.verification_code}</code></p>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setSelectedCertificate(certificate)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </button>
                        <button
                          onClick={() => generateCertificate(certificate)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Certificate Preview Modal */}
          {selectedCertificate && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg max-w-4xl w-full mx-4 p-8">
                <div className="border-4 border-indigo-600 rounded-lg p-12 text-center">
                  <h1 className="text-4xl font-serif text-indigo-600 mb-6">Certificate of Completion</h1>
                  <p className="text-lg mb-4">This is to certify that</p>
                  <h2 className="text-3xl font-bold mb-4">{selectedCertificate.user_name}</h2>
                  <p className="text-lg mb-4">has successfully completed</p>
                  <h3 className="text-2xl font-semibold text-indigo-600 mb-6">
                    {selectedCertificate.curriculum_title}
                  </h3>
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Date: {new Date(selectedCertificate.completion_date).toLocaleDateString()}</p>
                    {selectedCertificate.grade && <p>Grade: {selectedCertificate.grade}</p>}
                    <p>Verification: {selectedCertificate.verification_code}</p>
                  </div>
                  <div className="flex justify-around mt-12">
                    <div className="text-center">
                      <div className="border-t-2 border-gray-400 w-40 mx-auto mb-2"></div>
                      <p className="text-sm">Instructor</p>
                    </div>
                    <div className="text-center">
                      <div className="border-t-2 border-gray-400 w-40 mx-auto mb-2"></div>
                      <p className="text-sm">Director</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 flex justify-end space-x-2">
                  <button
                    onClick={() => setSelectedCertificate(null)}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => generateCertificate(selectedCertificate)}
                    className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Print Certificate
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}