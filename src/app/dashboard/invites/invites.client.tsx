"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface Invite {
  id: string;
  code: string;
  createdBy: string;
  usedBy: string | null;
  used: boolean;
  createdAt: Date;
  expiresAt: Date | null;
  creator: { username: string | null; email: string };
  user: { username: string | null; email: string } | null;
}

export default function InvitesPageClient({ invites }: { invites: Invite[] }) {
  const [invitesData, setInvitesData] = useState(invites);

  const handleDeleteInvite = async (inviteId: string) => {
    if (!confirm('Are you sure you want to delete this invite code?')) {
      return;
    }

    try {
      const response = await fetch('/api/invites/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inviteId }),
      });

      if (response.ok) {
        // Remove the deleted invite from the local state
        setInvitesData(prev => prev.filter(invite => invite.id !== inviteId));
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete invite');
      }
    } catch (error) {
      console.error('Error deleting invite:', error);
      alert('Failed to delete invite');
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          className="mb-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold">Invite Management</h1>
          <p className="text-neutral-400 mt-2">Manage invite codes for new users</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">All Invites</h2>
                <span className="text-sm text-neutral-400">{invitesData.length} total</span>
              </div>

              {invitesData.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <p>No invite codes created yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="py-3 px-4 text-left text-sm font-medium text-neutral-300 uppercase tracking-wider">Code</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-neutral-300 uppercase tracking-wider">Created By</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-neutral-300 uppercase tracking-wider">Used By</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-neutral-300 uppercase tracking-wider">Status</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-neutral-300 uppercase tracking-wider">Created</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-neutral-300 uppercase tracking-wider">Expires</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-neutral-300 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {invitesData.map((invite) => (
                        <tr key={invite.id} className="hover:bg-white/5 transition-colors">
                          <td className="py-3 px-4">
                            <code className="font-mono bg-black/40 px-2 py-1 rounded text-sm">
                              {invite.code}
                            </code>
                          </td>
                          <td className="py-3 px-4">
                            {invite.creator.username || invite.creator.email}
                          </td>
                          <td className="py-3 px-4">
                            {invite.used ? (
                              <span className="text-green-400">
                                {invite.user?.username || invite.user?.email || 'Unknown'}
                              </span>
                            ) : (
                              <span className="text-neutral-500">Not used</span>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              invite.used 
                                ? 'bg-green-500/20 text-green-400' 
                                : invite.expiresAt && new Date(invite.expiresAt) < new Date()
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {invite.used 
                                ? 'Used' 
                                : invite.expiresAt && new Date(invite.expiresAt) < new Date()
                                  ? 'Expired'
                                  : 'Active'}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4">
                            {invite.expiresAt 
                              ? new Date(invite.expiresAt).toLocaleDateString() 
                              : 'Never'}
                          </td>
                          <td className="py-3 px-4">
                            {!invite.used && (
                              <button
                                type="button"
                                className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all"
                                onClick={() => handleDeleteInvite(invite.id)}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div>
            <form onSubmit={async (e) => {
              e.preventDefault();
              
              const formData = new FormData(e.currentTarget);
              const expiresAt = formData.get('expiresAt') as string;
              
              try {
                const response = await fetch('/api/invites/create', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ expiresAt: expiresAt || null }),
                });
                
                if (response.ok) {
                  // Refresh the page to show the new invite
                  window.location.reload();
                } else {
                  const data = await response.json();
                  alert(data.error || 'Failed to create invite');
                }
              } catch (error) {
                console.error('Error creating invite:', error);
                alert('Failed to create invite');
              }
            }} className="bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Create New Invite</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-neutral-300 uppercase tracking-wider">
                    Expiration Date (Optional)
                  </label>
                  <input
                    type="date"
                    name="expiresAt"
                    className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/20 transition-all"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Leave blank for no expiration</p>
                </div>

                <motion.button
                  type="submit"
                  className="px-6 py-3 rounded-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white transition-all shadow-lg shadow-purple-500/20 w-full"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Create Invite Code
                </motion.button>
              </div>
            </form>
            
            <div className="mt-8 bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Invite System Info</h3>
              <ul className="space-y-2 text-sm text-neutral-400">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Invite codes are unique and can only be used once</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Admins can create unlimited invite codes</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Invite codes can have expiration dates</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Used invite codes cannot be reused</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}