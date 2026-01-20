// Example usage of the Member Invitation System API
// This file demonstrates how to use the invitation API routes from a React component

import { useState } from 'react';

interface InviteData {
  email: string;
  inviteCode: string;
  inviteUrl: string;
}

// ============================================
// 1. CREATE AND SEND INVITATION
// ============================================
export async function inviteMemberToGroup(groupId: string, email: string) {
  try {
    const response = await fetch(`/api/groups/${groupId}/invite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to send invitation');
    }

    console.log('✅ Invitation sent:', data);
    return data;
  } catch (error) {
    console.error('❌ Error inviting member:', error);
    throw error;
  }
}

// ============================================
// 2. VALIDATE INVITE CODE
// ============================================
export async function validateInviteCode(groupId: string, inviteCode: string) {
  try {
    const response = await fetch(`/api/groups/${groupId}/invite/${inviteCode}`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to validate invitation');
    }

    console.log('✅ Invite valid:', data);
    return data;
  } catch (error) {
    console.error('❌ Error validating invite:', error);
    throw error;
  }
}

// ============================================
// 3. ACCEPT INVITATION
// ============================================
export async function acceptInvitation(groupId: string, inviteCode: string) {
  try {
    const response = await fetch(`/api/groups/${groupId}/members/${inviteCode}/accept`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to accept invitation');
    }

    console.log('✅ Successfully joined group:', data);
    return data;
  } catch (error) {
    console.error('❌ Error accepting invitation:', error);
    throw error;
  }
}

// ============================================
// 4. REMOVE MEMBER FROM GROUP
// ============================================
export async function removeMemberFromGroup(groupId: string, memberId: number) {
  try {
    const response = await fetch(`/api/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to remove member');
    }

    console.log('✅ Member removed:', data);
    return data;
  } catch (error) {
    console.error('❌ Error removing member:', error);
    throw error;
  }
}

// ============================================
// 5. GET PENDING INVITES
// ============================================
export async function getPendingInvites(groupId: string) {
  try {
    const response = await fetch(`/api/groups/${groupId}/invite`);

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch invitations');
    }

    console.log('✅ Pending invites:', data.invites);
    return data.invites;
  } catch (error) {
    console.error('❌ Error fetching invites:', error);
    throw error;
  }
}

// ============================================
// 6. REVOKE INVITATION
// ============================================
export async function revokeInvitation(groupId: string, inviteCode: string) {
  try {
    const response = await fetch(`/api/groups/${groupId}/invite/${inviteCode}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to revoke invitation');
    }

    console.log('✅ Invitation revoked:', data);
    return data;
  } catch (error) {
    console.error('❌ Error revoking invitation:', error);
    throw error;
  }
}

// ============================================
// REACT COMPONENT EXAMPLE
// ============================================
export function InviteMemberForm({ groupId }: { groupId: string }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await inviteMemberToGroup(groupId, email);
      setSuccess(`Invitation sent to ${email}!`);
      setEmail('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Invite by email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          placeholder="friend@example.com"
        />
      </div>

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}

      {success && (
        <div className="text-green-600 text-sm">{success}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? 'Sending...' : 'Send Invitation'}
      </button>
    </form>
  );
}

// ============================================
// INVITE ACCEPTANCE PAGE EXAMPLE
// ============================================
export function InviteAcceptPage({ groupId, inviteCode }: { groupId: string; inviteCode: string }) {
  const [validating, setValidating] = useState(true);
  const [inviteData, setInviteData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    validateInviteCode(groupId, inviteCode)
      .then(setInviteData)
      .catch((err) => setError(err.message))
      .finally(() => setValidating(false));
  }, [groupId, inviteCode]);

  const handleAccept = async () => {
    try {
      await acceptInvitation(groupId, inviteCode);
      // Redirect to group page
      window.location.href = `/groups/${groupId}`;
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (validating) {
    return <div>Validating invitation...</div>;
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!inviteData?.valid) {
    return <div>Invalid invitation</div>;
  }

  if (inviteData.alreadyMember) {
    return <div>You are already a member of this group!</div>;
  }

  return (
    <div className="text-center">
      <h1 className="text-2xl font-bold mb-4">
        You're invited to join "{inviteData.groupName}"
      </h1>
      <p className="mb-6">
        Invited by: {inviteData.inviterEmail}
      </p>
      <button
        onClick={handleAccept}
        className="bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700"
      >
        Accept Invitation
      </button>
    </div>
  );
}

// ============================================
// MEMBER LIST WITH REMOVE OPTION
// ============================================
export function MemberList({ groupId, members }: { groupId: string; members: any[] }) {
  const handleRemoveMember = async (memberId: number, memberEmail: string) => {
    if (!confirm(`Are you sure you want to remove ${memberEmail} from the group?`)) {
      return;
    }

    try {
      await removeMemberFromGroup(groupId, memberId);
      // Refresh member list
      window.location.reload();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <ul className="space-y-2">
      {members.map((member) => (
        <li key={member.id} className="flex justify-between items-center p-3 border rounded">
          <div>
            <div className="font-medium">{member.email}</div>
            <div className="text-sm text-gray-500">{member.role}</div>
          </div>
          <button
            onClick={() => handleRemoveMember(member.id, member.email)}
            className="text-red-600 hover:text-red-800"
          >
            Remove
          </button>
        </li>
      ))}
    </ul>
  );
}
