'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner, faCheckCircle, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface ProfileData {
  _id: string;
  email: string;
  name: string;
  studentName?: string;
  studentEmail?: string;
  parentName?: string;
  parentEmails?: string[];
  targetMarks: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    studentName: '',
    studentEmail: '',
    parentName: '',
    parentEmails: [''],
    targetMarks: 650,
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    
    try {
      setLoading(true);
      const res = await fetch('/api/auth/profile-settings', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProfileData(data.user);
        setFormData({
          studentName: data.user.studentName || '',
          studentEmail: data.user.studentEmail || '',
          parentName: data.user.parentName || '',
          parentEmails: data.user.parentEmails && data.user.parentEmails.length > 0 ? data.user.parentEmails : [''],
          targetMarks: data.user.targetMarks || 650,
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage({ type: 'error', text: 'Failed to load profile' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'targetMarks' ? parseInt(value) : value,
    }));
  };

  const handleParentEmailChange = (index: number, value: string) => {
    const updated = [...formData.parentEmails];
    updated[index] = value;
    setFormData((prev) => ({
      ...prev,
      parentEmails: updated,
    }));
  };

  const addParentEmail = () => {
    setFormData((prev) => ({
      ...prev,
      parentEmails: [...prev.parentEmails, ''],
    }));
  };

  const removeParentEmail = (index: number) => {
    if (formData.parentEmails.length === 1) {
      setMessage({ type: 'error', text: 'At least one parent email field must remain' });
      return;
    }
    setFormData((prev) => ({
      ...prev,
      parentEmails: prev.parentEmails.filter((_, i) => i !== index),
    }));
  };

  const validateEmails = () => {
    if (formData.studentEmail && !formData.studentEmail.endsWith('@gmail.com')) {
      setMessage({ type: 'error', text: 'Student email must end with @gmail.com' });
      return false;
    }
    
    for (const email of formData.parentEmails) {
      if (email && email.trim() && !email.endsWith('@gmail.com')) {
        setMessage({ type: 'error', text: 'All parent emails must end with @gmail.com' });
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmails()) {
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      setSaving(true);
      setMessage(null);

      // Filter out empty parent emails before sending
      const dataToSend = {
        ...formData,
        parentEmails: formData.parentEmails.filter((email) => email.trim()),
      };

      const res = await fetch('/api/auth/profile-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setProfileData(data.user);
        setTimeout(() => setMessage(null), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to save profile' });
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setMessage({ type: 'error', text: 'Network error. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <FontAwesomeIcon
          icon={faSpinner}
          className="text-3xl text-black animate-spin"
        />
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="px-4 py-6 sm:px-6 md:px-8 md:py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-black mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your student and parent contact information for notifications</p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-6 p-4 rounded-sm border flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <FontAwesomeIcon
              icon={message.type === 'success' ? faCheckCircle : faExclamationCircle}
              className={`flex-shrink-0 mt-0.5 ${
                message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}
            />
            <p className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
              {message.text}
            </p>
          </div>
        )}

        {/* Form Card */}
        <form onSubmit={handleSubmit} className="bg-white rounded-sm border border-gray-200 p-6 md:p-8 shadow-sm">
          {/* Current Account Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">Current Account</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Email
                </label>
                <input
                  type="email"
                  value={profileData?.email || ''}
                  disabled
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 mt-1">This is your login email and cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account Name
                </label>
                <input
                  type="text"
                  value={profileData?.name || ''}
                  disabled
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 bg-gray-50 text-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Student Information Section */}
          <div className="mb-8 pb-8 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-black mb-4">Student Information</h2>
            <p className="text-sm text-gray-600 mb-4">This will appear in test notifications</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="studentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Student Name
                </label>
                <input
                  id="studentName"
                  type="text"
                  name="studentName"
                  value={formData.studentName}
                  onChange={handleChange}
                  placeholder="Enter student's full name"
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0"
                />
              </div>

              <div>
                <label htmlFor="studentEmail" className="block text-sm font-medium text-gray-700 mb-2">
                  Student Gmail Address
                </label>
                <input
                  id="studentEmail"
                  type="email"
                  name="studentEmail"
                  value={formData.studentEmail}
                  onChange={handleChange}
                  placeholder="student@gmail.com"
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0"
                />
                <p className="text-xs text-gray-500 mt-1">Must end with @gmail.com</p>
              </div>

              <div>
                <label htmlFor="targetMarks" className="block text-sm font-medium text-gray-700 mb-2">
                  Target NEET Marks
                </label>
                <input
                  id="targetMarks"
                  type="number"
                  name="targetMarks"
                  value={formData.targetMarks}
                  onChange={handleChange}
                  min="0"
                  max="720"
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0"
                />
                <p className="text-xs text-gray-500 mt-1">Default: 650/720</p>
              </div>
            </div>
          </div>

          {/* Parent Information Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-black mb-4">Parent/Guardian Information</h2>
            <p className="text-sm text-gray-600 mb-4">Optional: Parent/guardian(s) will receive test completion notifications</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="parentName" className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Name
                </label>
                <input
                  id="parentName"
                  type="text"
                  name="parentName"
                  value={formData.parentName}
                  onChange={handleChange}
                  placeholder="Enter parent's full name"
                  className="w-full px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Parent/Guardian Email Address(es)
                </label>
                <p className="text-xs text-gray-500 mb-3">Add one or more parent/guardian Gmail addresses</p>
                
                <div className="space-y-2">
                  {formData.parentEmails.map((email, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => handleParentEmailChange(index, e.target.value)}
                        placeholder="parent@gmail.com"
                        className="flex-1 px-4 py-2 rounded-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-0"
                      />
                      {formData.parentEmails.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeParentEmail(index)}
                          className="px-3 py-2 bg-red-50 text-red-600 rounded-sm border border-red-200 hover:bg-red-100 transition-all font-medium text-sm"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addParentEmail}
                  className="mt-3 px-4 py-2 bg-gray-100 text-gray-700 rounded-sm border border-gray-300 hover:bg-gray-200 transition-all font-medium text-sm"
                >
                  + Add Another Parent Email
                </button>

                <p className="text-xs text-gray-500 mt-2">Must end with @gmail.com</p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-6 py-3 bg-black text-white rounded-sm font-medium hover:bg-gray-900 active:bg-gray-950 disabled:bg-gray-400 transition-all flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} className="animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Profile'
              )}
            </button>
            <button
              type="reset"
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-sm font-medium hover:bg-gray-200 transition-all"
            >
              Reset
            </button>
          </div>
        </form>

        {/* Info Section */}
        <div className="mt-8 p-4 md:p-6 bg-blue-50 border border-blue-200 rounded-sm">
          <h3 className="font-semibold text-blue-900 mb-2">📧 About Notifications</h3>
          <p className="text-sm text-blue-800 mb-3">
            When you complete a test, notifications will be automatically sent to:
          </p>
          <ul className="text-sm text-blue-800 space-y-1 ml-4">
            <li>✓ Your student email (if provided)</li>
            <li>✓ All parent/guardian emails (if provided - you can add multiple!)</li>
          </ul>
          <p className="text-xs text-blue-700 mt-3">
            Each notification includes the test report as a PDF attachment for your records.
          </p>
        </div>
      </div>
    </div>
  );
}
