import { Theme } from './theme'

export const minimalCard = {
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    borderRadius: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
}

export const minimalButton = {
    backgroundColor: Theme.colors.accent,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
}

export const minimalInput = {
    backgroundColor: Theme.colors.surface2,
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    padding: 14,
}

// Keep old names as aliases for compatibility during transition
export const neoCard = minimalCard
export const neoButton = minimalButton
export const neoInput = minimalInput
