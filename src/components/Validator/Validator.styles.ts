/**
 * Validator Styled Components
 * Mirrors the DiffChecker styling for consistency
 */

import styled from 'styled-components';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(4)};
  padding: ${(props) => props.theme.spacing(4)};
  background-color: ${(props) => props.theme.colors.background};
  min-height: 100vh;
  transition: background-color 0.3s ease;
`;

export const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(2)};
`;

export const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${(props) => props.theme.colors.text};
  margin: 0;
`;

export const Description = styled.p`
  font-size: 1rem;
  color: ${(props) => props.theme.colors.subtleText};
  margin: 0;
`;

export const ControlBar = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing(3)};
  flex-wrap: wrap;
  align-items: center;
`;

export const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(4)};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;

  /* Ripple effect */
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    transform: scale(0);
    transition: transform 0.5s ease;
  }

  &:active:not(:disabled)::after {
    transform: scale(2);
    transition: transform 0s;
  }

  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return `
          background-color: ${props.theme.colors.primary};
          color: ${props.theme.colors.white};
          border-color: ${props.theme.colors.primary};
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
        `;
      case 'danger':
        return `
          background-color: ${props.theme.colors.error};
          color: ${props.theme.colors.white};
          border-color: ${props.theme.colors.error};
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &:hover:not(:disabled) {
            opacity: 0.9;
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
        `;
      default:
        return `
          background-color: ${props.theme.colors.cardBackground};
          color: ${props.theme.colors.text};

          &:hover:not(:disabled) {
            background-color: ${props.theme.colors.border};
            transform: translateY(-1px);
          }
        `;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:active:not(:disabled) {
    transform: scale(0.98);
  }

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const Select = styled.select`
  padding: ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(3)};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:focus {
    outline: none;
    border-color: ${(props) => props.theme.colors.primary};
  }
`;

export const InputPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(2)};
`;

export const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
`;

export const PanelTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin: 0;
`;

export const TextArea = styled.textarea<{ $hasError?: boolean }>`
  width: 100%;
  min-height: 400px;
  padding: ${(props) => props.theme.spacing(3)};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.$hasError ? props.theme.colors.error : props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  color: ${(props) => props.theme.colors.text};
  font-family: 'Courier New', monospace;
  font-size: 0.875rem;
  line-height: 1.5;
  resize: vertical;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: ${(props) => props.$hasError ? props.theme.colors.error : props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${(props) => props.$hasError 
      ? props.theme.colors.error + '20' 
      : props.theme.colors.primary + '20'};
  }

  &::placeholder {
    color: ${(props) => props.theme.colors.subtleText};
  }
`;

export const FileInput = styled.input`
  display: none;
`;

export const FileInputLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
  padding: ${(props) => props.theme.spacing(2)} ${(props) => props.theme.spacing(3)};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  color: ${(props) => props.theme.colors.text};
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: ${(props) => props.theme.colors.border};
  }
`;

export const ValidationMessage = styled.div<{ type: 'error' | 'success' }>`
  padding: ${(props) => props.theme.spacing(3)};
  border-radius: ${(props) => props.theme.radii.md};
  border: 2px solid;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  
  ${(props) => {
    switch (props.type) {
      case 'error':
        return `
          background-color: ${props.theme.colors.diffRemoved};
          color: ${props.theme.colors.diffRemovedText};
          border-color: ${props.theme.colors.error};
        `;
      case 'success':
        return `
          background-color: ${props.theme.colors.diffAdded};
          color: ${props.theme.colors.diffAddedText};
          border-color: ${props.theme.colors.success};
        `;
    }
  }}
`;

export const ValidationTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: ${(props) => props.theme.spacing(1)};
`;

export const ValidationError = styled.div`
  font-size: 0.875rem;
  line-height: 1.5;
  font-family: 'Courier New', monospace;
  margin-top: ${(props) => props.theme.spacing(1)};
  padding: ${(props) => props.theme.spacing(2)};
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: ${(props) => props.theme.radii.sm};
  white-space: pre-wrap;
  word-break: break-word;
`;

export const Stats = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing(4)};
  padding: ${(props) => props.theme.spacing(3)};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  flex-wrap: wrap;
`;

export const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.spacing(1)};
`;

export const StatLabel = styled.span`
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.subtleText};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const StatValue = styled.span`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
`;

export const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${(props) => props.theme.spacing(8)};
  text-align: center;
  color: ${(props) => props.theme.colors.subtleText};
  gap: ${(props) => props.theme.spacing(2)};
  animation: fadeIn 0.3s ease-in;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const EmptyStateIcon = styled.div`
  font-size: 3rem;
  animation: pulse 2s ease-in-out infinite;

  @keyframes pulse {
    0%, 100% {
      transform: scale(1);
      opacity: 1;
    }
    50% {
      transform: scale(1.05);
      opacity: 0.8;
    }
  }
`;

export const EmptyStateText = styled.p`
  font-size: 1rem;
  margin: 0;
`;

export const EmptyStateHint = styled.p`
  font-size: 0.875rem;
  margin: 0;
  color: ${(props) => props.theme.colors.subtleText};
  font-style: italic;
`;

// Drag & Drop styled components
export const DropZone = styled.div<{ $isDragging: boolean }>`
  position: relative;
  transition: all 0.3s ease;
  border-radius: ${(props) => props.theme.radii.md};
  
  ${(props) => props.$isDragging && `
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      border: 3px dashed ${props.theme.colors.primary};
      border-radius: ${props.theme.radii.md};
      background-color: ${props.theme.colors.primary}15;
      z-index: 1;
      animation: pulse-border 1s ease-in-out infinite;
      pointer-events: none;
    }

    @keyframes pulse-border {
      0%, 100% {
        opacity: 1;
        transform: scale(1);
      }
      50% {
        opacity: 0.7;
        transform: scale(0.98);
      }
    }
  `}
`;

export const DropOverlay = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${(props) => props.theme.colors.background}95;
  border-radius: ${(props) => props.theme.radii.md};
  z-index: 2;
  backdrop-filter: blur(4px);
  animation: fadeIn 0.2s ease;
  pointer-events: none;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const DropMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
  font-size: 1.5rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.primary};
  padding: ${(props) => props.theme.spacing(4)};
  border-radius: ${(props) => props.theme.radii.lg};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.primary};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  animation: bounce 0.6s ease-in-out infinite;

  @keyframes bounce {
    0%, 100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-10px);
    }
  }
`;

export const FileSizeHint = styled.span`
  font-size: 0.875rem;
  font-weight: 500;
  color: ${(props) => props.theme.colors.subtleText};
  opacity: 0.8;
`;

// Session Storage Components (matching DiffChecker)
export const OptionsBar = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing(4)};
  padding: ${(props) => props.theme.spacing(3)};
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: ${(props) => props.theme.radii.md};
  flex-wrap: wrap;
  align-items: center;
  animation: slideDown 0.3s ease-out;

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const OptionsTitle = styled.span`
  font-size: 0.875rem;
  font-weight: 600;
  color: ${(props) => props.theme.colors.text};
  margin-right: ${(props) => props.theme.spacing(2)};
`;

export const CheckboxGroup = styled.div`
  display: flex;
  gap: ${(props) => props.theme.spacing(4)};
  flex-wrap: wrap;
`;

export const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(2)};
  cursor: pointer;
  font-size: 0.875rem;
  color: ${(props) => props.theme.colors.text};
  user-select: none;
  transition: all 0.2s ease;

  &:hover {
    color: ${(props) => props.theme.colors.primary};
  }
`;

export const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${(props) => props.theme.colors.primary};
  border-radius: ${(props) => props.theme.radii.sm};
  transition: all 0.2s ease;

  &:focus-visible {
    outline: 2px solid ${(props) => props.theme.colors.primary};
    outline-offset: 2px;
  }
`;

export const OptionBadge = styled.span<{ $isActive?: boolean }>`
  font-size: 0.75rem;
  padding: ${(props) => props.theme.spacing(1)} ${(props) => props.theme.spacing(2)};
  border-radius: ${(props) => props.theme.radii.sm};
  background-color: ${(props) => props.$isActive 
    ? props.theme.colors.primary + '20' 
    : props.theme.colors.border};
  color: ${(props) => props.$isActive 
    ? props.theme.colors.primary 
    : props.theme.colors.subtleText};
  font-weight: 500;
  transition: all 0.2s ease;
`;

export const LastSavedIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(1)};
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.subtleText};
  padding: ${(props) => props.theme.spacing(1)} ${(props) => props.theme.spacing(2)};
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.radii.sm};
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-5px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export const StorageSizeIndicator = styled.span`
  display: flex;
  align-items: center;
  gap: ${(props) => props.theme.spacing(1)};
  font-size: 0.75rem;
  color: ${(props) => props.theme.colors.subtleText};
  padding: ${(props) => props.theme.spacing(1)} ${(props) => props.theme.spacing(2)};
  background-color: ${(props) => props.theme.colors.background};
  border-radius: ${(props) => props.theme.radii.sm};
  font-family: 'Courier New', monospace;
  animation: fadeIn 0.3s ease;
`;

