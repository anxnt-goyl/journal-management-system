/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface UserAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  className?: string;
}

// A small, deterministic set of background colors so the same name always
// gets the same color (keeps things visually stable across re-renders/pages).
const PALETTE = ['#0f4c3a', '#5c3d99', '#1f4e79', '#8a3324', '#2d6a4f', '#7c3f00'];

function colorForName(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

function initialsForName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Renders the user's own uploaded photo when one exists. Otherwise renders a
 * generated initials avatar rather than falling back to a stock photo of a
 * random stranger, which is misleading (it isn't the actual signed-in person).
 */
export const UserAvatar: React.FC<UserAvatarProps> = ({ name, avatarUrl, className }) => {
  if (avatarUrl) {
    return <img src={avatarUrl} alt={name || 'User avatar'} className={className} />;
  }

  const displayName = name || 'User';
  const bg = colorForName(displayName);
  const initials = initialsForName(displayName);

  return (
    <div
      className={className}
      style={{
        backgroundColor: bg,
        color: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '0.75em',
        userSelect: 'none',
      }}
      role="img"
      aria-label={displayName}
    >
      {initials}
    </div>
  );
};
