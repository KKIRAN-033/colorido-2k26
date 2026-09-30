import React from 'react'
import { getCharacterPrimaryImage, handleCharacterImageError, getCharacterBgType } from '../../config/characterAssets'
import './CharacterAvatar.css'

export default function CharacterAvatar({
  character,
  size = 64,
  state = 'idle',
  showRing = true,
  className = '',
  pose = 'primary',
  imageSrc = null,
}) {
  if (!character) return null

  const color = character.themeColor || '#a855f7'
  const id = character.id || 'character_default'
  const displayImage = imageSrc || getCharacterPrimaryImage(id)
  const bgType = getCharacterBgType(id)

  const defaultAvatarBg = bgType === 'white'
    ? `radial-gradient(circle at 50% 45%, #ffffff 18%, ${color} 70%, #030712 100%)`
    : `radial-gradient(circle at 50% 50%, ${color}44 0%, #030712 100%)`

  return (
    <div
      className={`char-avatar-container state-${state} ${className}`}
      style={{ width: size, height: size }}
      title={`${character.name} — Featured Avenger for COLORIDO 2K26`}
    >
      {/* Background Aura Glow */}
      <div
        className="char-avatar-aura"
        style={{ background: character.glowColor || 'rgba(168, 85, 247, 0.5)' }}
      />

      {/* Orbiting Tech Ring */}
      {showRing && (
        <div
          className="char-avatar-ring"
          style={{ borderColor: `${color}88` }}
        />
      )}

      {/* Character Image */}
      {displayImage ? (
        <div
          className="char-avatar-image-wrap"
          style={{
            background: character.avatarBg || defaultAvatarBg,
          }}
        >
          <img
            src={displayImage}
            alt={`${character.name} — Featured Avenger for COLORIDO 2K26`}
            className={`char-avatar-img blend-mode-${bgType}`}
            loading="lazy"
            onError={handleCharacterImageError}
          />
        </div>
      ) : (
        /* Fallback: colored circle with character initial */
        <div
          className="char-avatar-fallback"
          style={{
            background: character.avatarBg || `linear-gradient(135deg, ${color}44 0%, #0f172a 100%)`,
          }}
        >
          <span style={{ color: color, fontSize: size * 0.35, fontWeight: 900 }}>
            {character.name?.[0] || '?'}
          </span>
        </div>
      )}
    </div>
  )
}
